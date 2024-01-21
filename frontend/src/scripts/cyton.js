//Joshua Brewster, AGPL (copyleft)

export class cyton { //Contains structs and necessary functions/API calls to analyze serial data for the OpenBCI Cyton and Daisy-Cyto

	constructor(
		onDecodedCallback = this.onDecodedCallback,
		onConnectedCallback = this.onConnectedCallback,
		onDisconnectedCallback = this.onDisconnectedCallback,
		mode = 'daisy', //"daisy", then "single" or whatever, daisy is the only real setting
	) {
		this.onDecodedCallback = onDecodedCallback;
		this.onConnectedCallback = onConnectedCallback;
		this.onDisconnectedCallback = onDisconnectedCallback;


		this.encoder = new TextEncoder("ascii");

		this.startRecording = "";
		this.endRecording = "";
		this.connected = false;
		this.subscribed = false;
		this.buffer = [];
		this.startByte = 160//0xA0; // Start byte value
		this.stopByte = 192//0xC0; // Stop byte value  //0xC0,0xC1,0xC2,0xC3,0xC4,0xC5,0xC6
		this.searchString = new Uint8Array([this.stopByte, this.startByte]); //Byte search string
		this.readRate = 16.666667; //Throttle EEG read speed. (1.953ms/sample min @103 bytes/line)
		this.readBufferSize = 2000; //Serial read buffer size, increase for slower read speeds (~1030bytes every 20ms) to keep up with the stream (or it will crash)

		this.sps = 250; // Sample rate
		this.nChannels = 16;
		this.nPeripheralChannels = 6; // accelerometer and gyroscope (2 bytes * 3 coordinates each)
		this.updateMs = 1000 / this.sps; //even spacing
		this.stepSize = 1 / (Math.pow(2, 23) - 1);
		this.vref = 4.50; //2.5V voltage ref +/- 250nV
		this.gain = 24;

		this.vscale = (this.vref / this.gain) * this.stepSize; //volts per step.
		this.uVperStep = 100000 * ((this.vref / this.gain) * this.stepSize); //uV per step.
		this.scalar = 1 / (100000 / ((this.vref / this.gain) * this.stepSize)); //steps per uV.

		this.maxBufferedSamples = this.sps * 60 * 1; //max samples in buffer this.sps*60*nMinutes = max minutes of data

		this.mode = mode;
		this.odd = false; //

		this.data = { //Data object to keep our head from exploding. Get current data with e.g. this.data.A0[this.data.count-1]
			count: 0,
			startms: 0,
			ms: [],
			'A0': [], 'A1': [], 'A2': [], 'A3': [], 'A4': [], 'A5': [], 'A6': [], 'A7': [], //ADC 0
			'A8': [], 'A9': [], 'A10': [], 'A11': [], 'A12': [], 'A13': [], 'A14': [], 'A15': [], //ADC 1
			'Ax': [], 'Ay': [], 'Az': [], 'Gx': [], 'Gy': [], 'Gz': []  //Peripheral data (accelerometer, gyroscope)
		};

		this.resetDataBuffers();

		//navigator.serial utils
		if (!navigator.serial) {
			console.error("`navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental')")
		}
		this.port = null;
		this.reader = null;
		this.baudrate = 115200;

	}

	resetDataBuffers() {
		this.data.count = 0;
		this.data.startms = 0;
		for (const prop in this.data) {
			if (typeof this.data[prop] === "object") {
				this.data[prop] = new Array(this.maxBufferedSamples).fill(0);
			}
		}
	}

	setScalar(gain = 24, stepSize = 1 / (Math.pow(2, 23) - 1), vref = 4.50) {
		this.stepSize = stepSize;
		this.vref = vref; //2.5V voltage ref +/- 250nV
		this.gain = gain;

		this.vscale = (this.vref / this.gain) * this.stepSize; //volts per step.
		this.uVperStep = 100000 * ((this.vref / this.gain) * this.stepSize); //uV per step.
		this.scalar = 1 / (100000 / ((this.vref / this.gain) * this.stepSize)); //steps per uV.
	}

	getLatestData(channel, count = 1) { //Return slice of specified size of the latest data from the specified channel
		let ct = count;
		if (ct <= 1) {
			return [this.data[channel][this.data.count - 1]];
		}
		else {
			if (ct > this.data.count) {
				ct = this.data.count;
			}
			return this.data[channel].slice(this.data.count - ct, this.data.count);
		}
	}

	//cyton uses signed ints
	bytesToInt16(x0, x1) {
		let int16 = ((0xFF & x0) << 8) | (0xFF & x1);
		if ((int16 & 0x00800000) > 0) {
			int16 |= 0xFFFF0000;
		} else {
			int16 &= 0x0000FFFF;
		}
		return int16;
	}

	int16ToBytes(y) { //Turns a 24 bit int into a 3 byte sequence
		return [y & 0xFF, (y >> 8) & 0xFF];
	}

	//cyton uses signed ints
	bytesToInt24(x0, x1, x2) { //Turns a 3 byte sequence into a 24 bit int
		let int24 = ((0xFF & x0) << 16) | ((0xFF & x1) << 8) | (0xFF & x2);
		if ((int24 & 0x00800000) > 0) {
			int24 |= 0xFF000000;
		} else {
			int24 &= 0x00FFFFFF;
		}
		return int24;
	}

	interpret24bitAsInt32(byteArray) {
		let newInt =
			((0xFF & byteArray[0]) << 16) |
			((0xFF & byteArray[1]) << 8) |
			(0xFF & byteArray[2]);

		if (newInt & 0x00800000) {
			newInt |= 0xFF000000;
		} else {
			newInt &= 0x00FFFFFF;
		}

		return newInt;
	}

	int24ToBytes(y) { //Turns a 24 bit int into a 3 byte sequence
		return [y & 0xFF, (y >> 8) & 0xFF, (y >> 16) & 0xFF];
	}

	async decode(buffer) {
		var needle = this.searchString;
		var haystack = buffer;
		var search = this.boyerMoore(needle);
		var skip = search.byteLength;
		var indices = [];
		let newLines = 0;

		for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
			indices.push(i);
		}

		if (indices.length >= 2) {
			for (let k = 1; k < indices.length; k++) {
				if (indices[k] - indices[k - 1] === 33) {
					var line = buffer.slice(indices[k - 1], indices[k] + 1); // Slice out this line to be decoded

					let odd = line[2] % 2 !== 0;

					if (this.data.count < this.maxBufferedSamples && ((this.mode === 'daisy' && odd) || this.mode !== 'daisy')) {
						this.data.count++;
					}

					if (this.data.count - 1 === 0) {
						this.data.ms[this.data.count - 1] = Date.now();
						this.data.startms = this.data.ms[0];
					} else if (odd) {
						this.data.ms[this.data.count - 1] = this.data.ms[this.data.count - 2] + this.updateMs;

						if (this.data.count >= this.maxBufferedSamples) {
							this.data.ms.splice(0, 5120);
							this.data.ms.push(new Array(5120).fill(0));
						}
					}

					for ( i = 3; i < 27; i += 3) {
						let channel;
						if (this.mode === 'daisy') {
							if (odd) {
								channel = "A" + (i - 3) / 3;
								this.odd = false;
							} else {
								channel = "A" + (8 + (i - 3) / 3);
								this.odd = true;
							}
						} else {
							channel = "A" + (i - 3) / 3;
						}
						this.data[channel][this.data.count - 1] = this.bytesToInt24(line[i], line[i + 1], line[i + 2]);

						if (this.data.count >= this.maxBufferedSamples) {
							this.data[channel].splice(0, 5120);
							this.data[channel].push(new Array(5120).fill(0));
						}
					}

					if (!odd) {
						this.data["Ax"][this.data.count - 1] = this.bytesToInt16(line[27], line[28]);
						this.data["Ay"][this.data.count - 1] = this.bytesToInt16(line[29], line[30]);
						this.data["Az"][this.data.count - 1] = this.bytesToInt16(line[31], line[32]);
					}

					if (this.data.count >= this.maxBufferedSamples) {
						this.data["Ax"].splice(0, 5120);
						this.data["Ay"].splice(0, 5120);
						this.data["Az"].splice(0, 5120);
						this.data["Ax"].push(new Array(5120).fill(0));
						this.data["Ay"].push(new Array(5120).fill(0));
						this.data["Az"].push(new Array(5120).fill(0));
						this.data.count -= 5120;
					}

					newLines++;
				}
			}

			if (newLines > 0) buffer.splice(0, indices[indices.length - 1]);
			return newLines;
		}
	}

	//Callbacks
	onDecodedCallback(newLinesInt) {
		console.log("new samples:", newLinesInt);
	}

	onConnectedCallback() {
		console.log("port connected!");
	}

	onDisconnectedCallback() {
		console.log("port disconnected!");
	}

	onReceive(value) {
		this.buffer.push(...value);
		//console.log(this.buffer);
		//console.log("decoding... ", this.buffer.length)
		let newLines = this.buffer
		console.log(newLines);
		//console.log(this.data)
		this.decode(this.buffer)
	}

	async sendMsg(msg) {
		msg += "\n";
		var bytes = this.encoder.encode(msg)
		const writer = this.port.writable.getWriter();
		await writer.write(bytes);
		writer.releaseLock();
		return true;
	}

	async onPortSelected(port, baud = this.baudrate) {
		try {
			try {
				await port.open({ baudRate: baud, bufferSize: this.readBufferSize });
				setTimeout(() => {
					this.onConnectedCallback();
					this.connected = true;
					this.subscribed = true;
					this.sendMsg('b');
				}, 500);

			} //API inconsistency in syntax between linux and windows
			catch {
				await port.open({ baudRate: baud, buffersize: this.readBufferSize });
				setTimeout(() => {
					this.onConnectedCallback();
					this.connected = true;
					this.subscribed = true;
					this.sendMsg('b');
					this.subscribe(port);//this.subscribeSafe(port);
				}, 500);
			}
		}
		catch (err) {
			console.log(err);
			this.connected = false;
		}
		this.connected = true;
		// Automatically start reading on successful connection
	}

	async startReading() {
		this.startRecording = this.getReadableTimestamp();
		this.reader = this.port.readable.getReader();
		while (this.connected) { // Use connected status or another condition to keep reading
			try {
				const { value, done } = await this.reader.read();
				if (value) {
					this.onReceive(value);
				}
				if (done) {
					console.log("Stream ended by the device");
					break;
				}
			} catch (error) {
				console.log(error);
				// Decide if you need to break or continue on certain errors
			}
		}
	}


	async stopReading() {
		this.endRecording = this.getReadableTimestamp();
		if (this.connected && this.reader) {
			this.connected = false; // This will break the loop in startReading

			// If you want to immediately cancel the ongoing reading operation
			// you can cancel the reader. This will cause the reader.read() promise
			// to reject, so make sure this is handled in startReading.
			await this.reader.cancel();
			const objectKeys = Object.keys(this.data);
			// Export buffer as CSV
			this.exportCSV(this.data, objectKeys);

			// Reset the buffer
			this.buffer = [];
			console.log("Stopped reading from serial port and buffer is reset");
		}
		console.log("Stopped reading from serial port");
	}
	exportCSV(content, objectKeys) {
		const csvContent = this.parseAndExportData(content, objectKeys);
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "eeg_data.csv");
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}



	getReadableTimestamp() {
		const now = new Date(); // Current date and time

		// Get individual components of the date
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');

		// Format the date and time in a readable format (YYYY-MM-DD HH:MM:SS)
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	parseAndExportData(data, objectKeys) {
		// Add headers using objectKeys
		const headers = objectKeys.map((key, index) => `A${index}`).join(',');

		// Convert data to CSV format
		const csvContent = `${headers}\n${objectKeys.map((key) =>
			Object.values(data[key]).map(value => (Array.isArray(value) ? value.join(',') : value))
				.join(',')
		).join('\n')}`;


		return csvContent;

	}

	convertBytesToInt(bytes) {
		// Convert 3-byte EEG data to a 24-bit signed integer
		let value = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
		// Assuming it's a 24-bit two's complement integer
		if (value & 0x800000) {
			value = value - 0x1000000;
		}
		return value;
	}


	

	async closePort(port = this.port) {
		//if(this.reader) {this.reader.releaseLock();}
		if (this.port) {
			this.subscribed = false;
			this.sendMsg('s');
			setTimeout(async () => {
				if (this.reader) {
					this.reader = null;
				}
				await port.close();
				this.port = null;
				this.connected = false;
				this.onDisconnectedCallback();
			}, 100);
		}
	}

	async setupSerialAsync(baudrate = 115200) { //You can specify baudrate just in case
		this.port = await navigator.serial.requestPort();
		navigator.serial.addEventListener("disconnect", (e) => {
			console.log(e)
			this.closePort(this.port);
		});
		this.onPortSelected(this.port, baudrate);

		//navigator.serial.addEventListener("onReceive", (e) => {console.log(e)});//this.onReceive(e));

	}


	//Boyer Moore fast byte search method copied from https://codereview.stackexchange.com/questions/20136/uint8array-indexof-method-that-allows-to-search-for-byte-sequences
	asUint8Array(input) {
		if (input instanceof Uint8Array) {
			return input;
		} else if (typeof (input) === 'string') {
			// This naive transform only supports ASCII patterns. UTF-8 support
			// not necessary for the intended use case here.
			var arr = new Uint8Array(input.length);
			for (var i = 0; i < input.length; i++) {
				var c = input.charCodeAt(i);
				if (c > 127) {
					throw new TypeError("Only ASCII patterns are supported");
				}
				arr[i] = c;
			}
			return arr;
		} else {
			// Assume that it's already something that can be coerced.
			return new Uint8Array(input);
		}
	}

	boyerMoore(patternBuffer) {
		// Implementation of Boyer-Moore substring search ported from page 772 of
		// Algorithms Fourth Edition (Sedgewick, Wayne)
		// http://algs4.cs.princeton.edu/53substring/BoyerMoore.java.html
		/*
		USAGE:
			// needle should be ASCII string, ArrayBuffer, or Uint8Array
			// haystack should be an ArrayBuffer or Uint8Array
			var search = boyerMoore(needle);
			var skip = search.byteLength;
			var indices = [];
			for (var i = search(haystack); i !== -1; i = search(haystack, i + skip)) {
				indices.push(i);
			}
		*/
		var pattern = this.asUint8Array(patternBuffer);
		var M = pattern.length;
		if (M === 0) {
			throw new TypeError("patternBuffer must be at least 1 byte long");
		}
		// radix
		var R = 256;
		var rightmost_positions = new Int32Array(R);
		// position of the rightmost occurrence of the byte c in the pattern
		for (var c = 0; c < R; c++) {
			// -1 for bytes not in pattern
			rightmost_positions[c] = -1;
		}
		for (var j = 0; j < M; j++) {
			// rightmost position for bytes in pattern
			rightmost_positions[pattern[j]] = j;
		}
		var boyerMooreSearch = (txtBuffer, start, end) => {
			// Return offset of first match, -1 if no match.
			var txt = this.asUint8Array(txtBuffer);
			if (start === undefined) start = 0;
			if (end === undefined) end = txt.length;
			var pat = pattern;
			var right = rightmost_positions;
			var lastIndex = end - pat.length;
			var lastPatIndex = pat.length - 1;
			var skip;
			for (var i = start; i <= lastIndex; i += skip) {
				skip = 0;
				for (var j = lastPatIndex; j >= 0; j--) {
					var c = txt[i + j];
					if (pat[j] !== c) {
						skip = Math.max(1, j - right[c]);
						break;
					}
				}
				if (skip === 0) {
					return i;
				}
			}
			return -1;
		};
		boyerMooreSearch.byteLength = pattern.byteLength;
		return boyerMooreSearch;
	}


}
// At the end of cyton.js
