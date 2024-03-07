//Joshua Brewster, AGPL (copyleft)
class cyton {
  //Contains structs and necessary functions/API calls to analyze serial data for the OpenBCI Cyton and Daisy-Cyto

  constructor(
    onDecodedCallback = this.onDecodedCallback,
    onConnectedCallback = this.onConnectedCallback,
    onDisconnectedCallback = this.onDisconnectedCallback,
    mode = "daisy" //"daisy", then "single" or whatever, daisy is the only real setting
  ) {
    this.onDecodedCallback = onDecodedCallback;
    this.onConnectedCallback = onConnectedCallback;
    this.onDisconnectedCallback = onDisconnectedCallback;
    this.encoder = new TextEncoder("ascii");
    this.reader = "";
    this.startRecording = "";
    this.endRecording = "";
    this.connected = false;
    this.subscribed = false;
    this.buffer = [];
    this.startByte = 160; //0xA0; // Start byte value
    this.stopByte = 192; //0xC0; // Stop byte value  //0xC0,0xC1,0xC2,0xC3,0xC4,0xC5,0xC6
    this.searchString = new Uint8Array([this.stopByte, this.startByte]); //Byte search string
    this.readRate = 16.66667; //Throttle EEG read speed. (1.953ms/sample min @103 bytes/line)
    this.readBufferSize = 2000000; //Serial read buffer size, increase for slower read speeds (~1030bytes every 20ms) to keep up with the stream (or it will crash)

    this.sps = 250; // Sample rate
    this.nChannels = 21;
    this.nPeripheralChannels = 6; // accelerometer and gyroscope (2 bytes * 3 coordinates each)
    this.updateMs = 1000 / this.sps; //even spacing
    this.stepSize = 1 / (Math.pow(2, 23) - 1);
    this.vref = 4.5; //2.5V voltage ref +/- 250nV
    this.gain = 24;

    this.vscale = (this.vref / this.gain) * this.stepSize; //volts per step.
    this.uVperStep = 100000 * ((this.vref / this.gain) * this.stepSize); //uV per step.
    this.scalar = 1 / (100000 / ((this.vref / this.gain) * this.stepSize)); //steps per uV.

    this.maxBufferedSamples = this.sps * 60 * 1; //max samples in buffer this.sps*60*nMinutes = max minutes of data

    this.mode = mode;
    this.odd = false; //

    this.data = {
      //Data object to keep our head from exploding. Get current data with e.g. this.data.A0[this.data.count-1]
      count: 0,
      startms: 0,
      ms: [],
      A0: [],
      A1: [],
      A2: [],
      A3: [],
      A4: [],
      A5: [],
      A6: [],
      A7: [], //ADC 0
      Ax: [],
      Ay: [],
      Az: [],
      Gx: [],
      Gy: [],
      Gz: [], //Peripheral data (accelerometer, gyroscope)
    };

    this.resetDataBuffers();

    //navigator.serial utils
    if (!navigator.serial) {
      console.error(
        "`navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental')"
      );
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

  setScalar(gain = 24, stepSize = 1 / (Math.pow(2, 23) - 1), vref = 4.5) {
    this.stepSize = stepSize;
    this.vref = vref; //2.5V voltage ref +/- 250nV
    this.gain = gain;

    this.vscale = (this.vref / this.gain) * this.stepSize; //volts per step.
    this.uVperStep = 100000 * ((this.vref / this.gain) * this.stepSize); //uV per step.
    this.scalar = 1 / (100000 / ((this.vref / this.gain) * this.stepSize)); //steps per uV.
  }

  getLatestData(channel, count = 1) {
    //Return slice of specified size of the latest data from the specified channel
    let ct = count;
    if (ct <= 1) {
      return [this.data[channel][this.data.count - 1]];
    } else {
      if (ct > this.data.count) {
        ct = this.data.count;
      }
      return this.data[channel].slice(this.data.count - ct, this.data.count);
    }
  }

  //cyton uses signed ints
  bytesToInt16(x0, x1) {
    let int16 = ((0xff & x0) << 8) | (0xff & x1);
    if ((int16 & 0x00800000) > 0) {
      int16 |= 0xffff0000;
    } else {
      int16 &= 0x0000ffff;
    }
    return int16;
  }

  int16ToBytes(y) {
    //Turns a 24 bit int into a 3 byte sequence
    return [y & 0xff, (y >> 8) & 0xff];
  }

  //cyton uses signed ints
  bytesToInt24(x0, x1, x2) {
    //Turns a 3 byte sequence into a 24 bit int
    let int24 = ((0xff & x0) << 16) | ((0xff & x1) << 8) | (0xff & x2);
    if ((int24 & 0x00800000) > 0) {
      int24 |= 0xff000000;
    } else {
      int24 &= 0x00ffffff;
    }
    return int24;
  }

  interpret24bitAsInt32(byteArray) {
    let newInt =
      ((0xff & byteArray[0]) << 16) |
      ((0xff & byteArray[1]) << 8) |
      (0xff & byteArray[2]);

    if (newInt & 0x00800000) {
      newInt |= 0xff000000;
    } else {
      newInt &= 0x00ffffff;
    }

    return newInt;
  }

  int24ToBytes(y) {
    //Turns a 24 bit int into a 3 byte sequence
    return [y & 0xff, (y >> 8) & 0xff, (y >> 16) & 0xff];
  }

  async decode(buffer) {
    this.buffer.push(...buffer);
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

          if (
            this.data.count < this.maxBufferedSamples &&
            ((this.mode === "daisy" && odd) || this.mode !== "daisy")
          ) {
            this.data.count++;
          }

          this.data.ms[this.data.count - 1] = Date.now(); // Always create a new timestamp

          for (i = 3; i < 27; i += 3) {
            let channel;
            if (this.mode === "daisy") {
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
            this.data[channel][this.data.count - 1] =
              this.bytesToInt24(line[i], line[i + 1], line[i + 2]) * 0.02235;
            console.log(
              "Channel" +
                channel +
                ": " +
                this.data[channel][this.data.count - 1]
            );
            if (this.data.count >= this.maxBufferedSamples) {
              this.data[channel].splice(0, 5120);
              this.data[channel].push(new Array(5120).fill(0));
            }
          }

          if (!odd) {
            this.data["Ax"][this.data.count - 1] = this.bytesToInt16(
              line[27],
              line[28]
            );
            this.data["Ay"][this.data.count - 1] = this.bytesToInt16(
              line[29],
              line[30]
            );
            this.data["Az"][this.data.count - 1] = this.bytesToInt16(
              line[31],
              line[32]
            );
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
    //console.log(this.data)
    this.decode(this.buffer);
  }

  async sendMsg(msg) {
    msg += "\n";
    var bytes = this.encoder.encode(msg);
    const writer = this.port.writable.getWriter();
    await writer.write(bytes);
    writer.releaseLock();
    return true;
  }

  async onPortSelected(port, baud = this.baudrate) {
    try {
      try {
        await port.open({ baudRate: baud, bufferSize: 2000000000 });
        setTimeout(() => {
          this.onConnectedCallback();
          this.connected = true;
          this.subscribed = true;
          this.sendMsg("b");
        }, 500);
      } catch {
        //API inconsistency in syntax between linux and windows
        await port.open({ baudRate: baud, buffersize: 2000000000 });
        setTimeout(() => {
          this.onConnectedCallback();
          this.connected = true;
          this.subscribed = true;
          this.sendMsg("b");
          this.reader = this.port.readable.getReader();
          // this.subscribe(port); //this.subscribeSafe(port);
        }, 500);
      }
    } catch (err) {
      console.error(err);
      this.connected = false;
    }
    this.connected = true;
    // Automatically start reading on successful connection
  }

  async startReading() {
    this.startRecording = this.getReadableTimestamp();
    try {
      this.reader = this.port.readable.getReader();
      const streamData = async () => {
        try {
          const { value } = await this.reader.read();
          if (value) {
            try {
              this.onReceive(value);
            } catch {
              console.log("Error decoding data");
            }
          }
          if (this.subscribed === true) {
            setTimeout(() => {
              streamData();
            }, this.readRate);
          }
        } catch (error) {
          alert(
            "Bitte lade die Seite neu und schalte das EEG Gerät aus und wieder ein. "
          );
          console.log(error);
        }
      };
      streamData();
    } catch (error) {
      console.error("Error creating reader:", error);
      this.closePort();
    }
  }
  getData() {
    return this.data;
  }
  async stopReading(participantNumber) {
    this.endRecording = this.getReadableTimestamp();

    this.connected = false;
    try {
      // Close the reader and release the lock
      await this.reader.cancel();
    } catch (error) {
      console.log("Error releasing lock:", error);
    }
    const objectKeys = Object.keys(this.data);
    this.exportCSV(this.data, objectKeys, participantNumber);
    this.buffer = [];

    console.log("Stopped reading from serial port and buffer is reset");

    console.log("Stopped reading from serial port");
  }

  exportCSV(content, objectKeys, participantNumber) {
    const csvContent = this.parseAndExportData(content, objectKeys);
    const fileName = `${participantNumber}-${this.startRecording}.csv`;

    const formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("csvContent", csvContent);

    fetch("http://localhost:8081/api/save-csv", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("CSV file saved successfully:", data.filePath);
      })
      .catch((error) => {
        console.error("Error saving CSV file:", error);
      });
  }

  async stopCheck() {
    this.endRecording = this.getReadableTimestamp();
    if (this.connected && this.reader) {
      this.connected = false;
      try {
        // Close the reader and release the lock
        await this.reader.cancel();
      } catch (error) {
        console.log("Error releasing lock:", error);
      }
      this.buffer = [];
      console.log("Stopped reading from serial port and buffer is reset");
    }
    console.log("Stopped reading from serial port");
    return this.data;
  }

  getReadableTimestamp() {
    const now = new Date(); // Current date and time

    // Get individual components of the date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Format the date and time in a readable format (YYYY-MM-DD HH:MM:SS)
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  parseAndExportData(data, objectKeys) {
    // Add headers using objectKeys
    const headers = objectKeys.join(";");

    // Transpose data
    const transposedData = objectKeys.map((key) => {
      if (Array.isArray(data[key])) {
        return data[key];
      } else {
        // If it's a string, create an array with a single element
        return [data[key]];
      }
    });

    // Find the maximum length among the arrays
    const maxLength = Math.max(...transposedData.map((arr) => arr.length));

    // Fill shorter arrays with empty strings to match the maximum length
    const filledData = transposedData.map((arr) => {
      const diff = maxLength - arr.length;
      return arr.concat(Array(diff).fill(""));
    });

    // Create rows by taking values at the same index from each array
    const rows = [];
    for (let i = 0; i < parseInt(filledData[0][0]); i++) {
      const index = i + 1;
      let datetime = "";
      // Calculate datetime based on startms and previous datetime
      datetime = new Date(filledData[2][i]).toLocaleString();

      // Format datetime manually to avoid locale issues

      const rowValues = [index, datetime].concat(
        filledData.map((arr) => arr[i])
      );
      rows.push(rowValues.join(";"));
    }

    // Combine rows with newline characters
    const csvContent = "Index;Datetime;" + headers + "\n" + rows.join("\n");

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
      this.sendMsg("s");
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

  async setupSerialAsync(baudrate = 115200) {
    //You can specify baudrate just in case
    this.port = await navigator.serial.requestPort();
    navigator.serial.addEventListener("disconnect", (e) => {
      console.log(e);
      this.closePort(this.port);
    });
    this.onPortSelected(this.port, baudrate);

    //navigator.serial.addEventListener("onReceive", (e) => {console.log(e)});//this.onReceive(e));
  }

  async checkDevice(baudrate = 115200) {
    try {
      //You can specify baudrate just in case
      this.port = await navigator.serial.requestPort();
      navigator.serial.addEventListener("disconnect", (e) => {
        console.log(e);
        this.closePort(this.port);
      });
      await this.onPortSelected(this.port, baudrate);
      // this.startReading()
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      // await this.stopCheck();

      console.log("Done capturing data for approximately 10 seconds");
    } catch (error) {
      console.error("Error checking device:", error);
    }
  }

  //navigator.serial.addEventListener("onReceive", (e) => {console.log(e)});//this.onReceive(e));

  //Boyer Moore fast byte search method copied from https://codereview.stackexchange.com/questions/20136/uint8array-indexof-method-that-allows-to-search-for-byte-sequences
  asUint8Array(input) {
    if (input instanceof Uint8Array) {
      return input;
    } else if (typeof input === "string") {
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
  // Function to activate impedance measurement for a specific channel
  async activateImpedanceMeasurement(channel) {
    try {
      // Check if the port is writable before writing data
      if (this.port && this.port.writable) {
        const writer = this.port.writable.getWriter();
        let command;
        if (channel >= 0 && channel <= 7) {
          command = `z110s`; // Command to activate impedance measurement
          const commandBytes = new TextEncoder().encode(command);
          await writer.write(commandBytes);
          console.log(`Impedance measurement activated for channel ${channel}`);
          // Start continuous reading for 5 seconds
          readData();
        } else {
          console.error("Invalid channel number:", channel);
        }
        writer.releaseLock();
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error activating impedance measurement:", error);
    }
  }

  async readData() {
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          this.reader.releaseLock();
          break;
        }
        // Convert the received byte array to text
        const text = new TextDecoder().decode(value);
        // Process the received text
        console.log("Received data:", text);
      }
    } catch (error) {
      console.error("Error reading data:", error);
    }
  }
}

// At the end of cyton.js

window.cyton = cyton;
