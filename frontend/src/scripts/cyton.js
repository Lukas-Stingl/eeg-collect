//Joshua Brewster, AGPL (copyleft)
const channelAssignment = require("../config/channelAssignment.json");

export class cyton {
  //Contains structs and necessary functions/API calls to analyze serial data for the OpenBCI Cyton and Daisy-Cyto

  constructor(
    onDecodedCallback = this.onDecodedCallback,
    onConnectedCallback = this.onConnectedCallback,
    onDisconnectedCallback = this.onDisconnectedCallback
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

    this.mode = "";
    this.odd = false; //
    this.impedance = {};
    this.data = {
      count: "",
      sampleNumber: [],
      timestamp: [],
      A1: [],
      A2: [],
      A3: [],
      A4: [],
      A5: [],
      A6: [],
      A7: [],
      A8: [],
      A9: [],
      A10: [],
      A11: [],
      A12: [],
      A13: [],
      A14: [],
      A15: [],
      A16: [],
      Accel0: [],
      Accel1: [],
      Accel2: [],
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
  getImpedance(config) {
    const impedanceArray = [];
    let assignment = channelAssignment[config];
    console.log(assignment.length);
    if (Object.keys(assignment).length > 8) {
      this.mode = "daisy";
      this.data = {
        count: "",
        sampleNumber: [],
        timestamp: [],
        A1: [],
        A2: [],
        A3: [],
        A4: [],
        A5: [],
        A6: [],
        A7: [],
        A8: [],
        A9: [],
        A10: [],
        A11: [],
        A12: [],
        A13: [],
        A14: [],
        A15: [],
        A16: [],
        Accel0: [],
        Accel1: [],
        Accel2: [],
      };
    } else {
      this.mode = "cyton";
    }
    for (const channel in assignment) {
      const node_id = assignment[channel];
      let impedanceValue = this.impedance[channel];
      let state;

      if (impedanceValue === undefined) {
        state = 0; // Set state to 0 if channel not found
        impedanceValue = 0; // Set impedance to 0 if channel not found
      } else if (impedanceValue === 0) {
        state = 1;
        // 200kOhm
      } else if (impedanceValue < 750) {
        state = 3;
        // 750kOhm
      } else if (impedanceValue < 3000) {
        state = 2;
      } else {
        state = 1;
      }

      impedanceArray.push({
        node_id: node_id,
        state: state,
        impedance: impedanceValue,
      });
    }

    return impedanceArray;
  }
  resetImpedance(config) {
    const impedanceArray = [];
    this.impedance = [];
    let assignment = channelAssignment[config];

    for (const channel in assignment) {
      const node_id = assignment[channel];
      let impedanceValue = 0;
      let state = 0;

      impedanceArray.push({
        node_id: node_id,
        state: state,
        impedance: impedanceValue,
      });
    }

    return impedanceArray;
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
    if (byteArray.length !== 3) {
      throw new Error('Byte array must have exactly 3 elements');
    }
  
    let newInt = (
      ((0xFF & byteArray[0]) << 16) |
      ((0xFF & byteArray[1])  << 8) |
      (0xFF & byteArray[2])
    );
  
    // Check the sign bit (24th bit in this case)
    if ((newInt & 0x00800000) > 0) {
      // If the sign bit is set, extend the sign to the 32-bit integer
      newInt |= 0xFF000000;
    } else {
      // Else, ensure the integer is within 24-bit range
      newInt &= 0x00FFFFFF;
    }
  
    return newInt;
  }
  interpret16bitAsInt32(byteArray) {
    let newInt = ((0xff & byteArray[0]) << 8) | (0xff & byteArray[1]);

    if ((newInt & 0x00008000) > 0) {
      newInt |= 0xffff0000;
    } else {
      newInt &= 0x0000ffff;
    }

    return newInt;
  }

  exportImpedanceCSV(participantNumber) {
    const objectKeys = Object.keys(this.impedance);
    const csvContent = this.parseAndExportImpedance(this.impedance, objectKeys);
    let startTime = Math.floor(new Date(this.startRecording).getTime() / 1000);
    const fileName = `Impedance ${participantNumber}-${startTime}.csv`;

    const formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("csvContent", csvContent);

    fetch("/api/save-csv", {
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

  async configureBoard(command) {
    let startCommands;
    let resetCommands;
    if (this.mode === "daisy") {
      startCommands = [
        "z101Z", // Start impedance check for channel 1
        "z201Z", // Start impedance check for channel 2
        "z301Z", // Start impedance check for channel 3
        "z401Z", // Start impedance check for channel 4
        "z501Z", // Start impedance check for channel 5
        "z601Z", // Start impedance check for channel 6
        "z701Z", // Start impedance check for channel 7
        "z801Z", // Start impedance check for channel 8
        "zQ01Z", // Start impedance check for channel 9
        "zW01Z", // Start impedance check for channel 10
        "zE01Z", // Start impedance check for channel 11
        "zR01Z", // Start impedance check for channel 12
        "zT01Z", // Start impedance check for channel 13
        "zY01Z", // Start impedance check for channel 14
        "zU01Z", // Start impedance check for channel 15
        "zI01Z", // Start impedance check for channel 16
      ];
      resetCommands = [
        "z100Z", // Reset impedance check for channel 1
        "z200Z", // Reset impedance check for channel 2
        "z300Z", // Reset impedance check for channel 3
        "z400Z", // Reset impedance check for channel 4
        "z500Z", // Reset impedance check for channel 5
        "z600Z", // Reset impedance check for channel 6
        "z700Z", // Reset impedance check for channel 7
        "z800Z", // Reset impedance check for channel 8
        "zQ00Z", // Reset impedance check for channel 9
        "zW00Z", // Reset impedance check for channel 10
        "zE00Z", // Reset impedance check for channel 11
        "zR00Z", // Reset impedance check for channel 12
        "zT00Z", // Reset impedance check for channel 13
        "Y00Z", // Reset impedance check for channel 14
        "zU00Z", // Reset impedance check for channel 15
        "zI00Z", // Reset impedance check for channel 16
      ];
    } else {
      startCommands = [
        "x1000100Xz101Z", // Start impedance check for channel 1
        "x2000100Xz201Z", // Start impedance check for channel 2
        "x3000100Xz301Z", // Start impedance check for channel 3
        "x4000100Xz401Z", // Start impedance check for channel 4
        "x5000100Xz501Z", // Start impedance check for channel 5
        "x6000100Xz601Z", // Start impedance check for channel 6
        "x7000100Xz701Z", // Start impedance check for channel 7
        "x8000100Xz801Z", // Start impedance check for channel 8
      ];
      resetCommands = [
        "x1060110Xz100Z", // Reset impedance check for channel 1
        "x2060110Xz200Z", // Reset impedance check for channel 2
        "x3060110Xz300Z", // Reset impedance check for channel 3
        "x4060110Xz400Z", // Reset impedance check for channel 4
        "x5060110Xz500Z", // Reset impedance check for channel 5
        "x6060110Xz600Z", // Reset impedance check for channel 6
        "x7060110Xz700Z", // Reset impedance check for channel 7
        "x8060110Xz800Z", // Reset impedance check for channel 8
      ];
    }

    const index = parseInt(command); // Assuming command is a number indicating the channel index
    const impedanceCommand = startCommands[index - 1]; // Get the corresponding impedance check command
    const resetCommand = resetCommands[index - 1]; // Get the corresponding reset command

    if (impedanceCommand && resetCommand) {
      try {
        // Check if the port is writable before writing data
        if (this.port && this.port.writable) {
          var writer = this.port.writable.getWriter();
          const impedanceCommandBytes = new TextEncoder().encode(
            impedanceCommand
          );
          await writer.write(impedanceCommandBytes);
          console.log(impedanceCommand);
          console.log("Impedance check command sent for channel " + index);
          writer.releaseLock();
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 5 seconds
          await this.startReading(); // Start recording for 5 seconds
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
          console.log("Waiting for 5 sec"); // Deactivate impedance measurement after 5 seconds
          await this.stopImpedance("A" + index);
          writer = this.port.writable.getWriter();
          const resetCommandBytes = new TextEncoder().encode(resetCommand);
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 5 seconds
          await writer.write(resetCommandBytes);
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 5 seconds
          console.log("Reset command sent for channel " + index);
          writer.releaseLock();
        } else {
          console.error("Serial port is not writable");
        }
      } catch (error) {
        console.error("Error sending commands:", error);
      }
    } else {
      console.error("Invalid channel index:", command);
    }
  }
  async defaultChannelSettings(){
    try{
    if (this.port && this.port.writable) {
      const writer = this.port.writable.getWriter();
      const command = "d"; // Command to start recording
      const commandBytes = new TextEncoder().encode(command);
      await writer.write(commandBytes);
      console.log("Recording started");

      writer.releaseLock();
    } else {
      console.error("Serial port is not writable");
    }
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}
  
  async startReading() {
    this.startRecording = this.getReadableTimestamp();
    try {
      // Check if the port is writable before writing data
      if (this.port && this.port.writable) {
        const writer = this.port.writable.getWriter();
        const command = "b"; // Command to start recording
        const commandBytes = new TextEncoder().encode(command);
        await writer.write(commandBytes);
        console.log("Recording started");

        writer.releaseLock();
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }
  async readData() {
    try {
      let buffer = []; // Buffer to accumulate bytes until a complete chunk is formed
      let headerFound = false;

      while (this.connected === true) {
        const { value, done } = await this.reader.read();
        if (done) {
          this.reader.releaseLock();
          break;
        }
        for (let i = 0; i < value.length; i++) {
          // Check if the header is found
          if (!headerFound && value[i] === 160) {
            headerFound = true;
          } else if (!headerFound && headerFound === false) {
            const text = new TextDecoder().decode(value);
            console.log(text);
          }

          if (headerFound) {
            buffer.push(value[i]);
          }

          // Check if a complete chunk is formed

          // Decode the chunk

          // Stop receiving data if the stop byte is found
          if (this.mode === "daisy") {
            if (value[i] >= 192 && value[i] <= 198 && buffer.length > 30) {
              headerFound = false;
              this.decodeDaisy(buffer);

              // Reset buffer for the next chunk
              buffer = [];
            }
          } else {
            if (value[i] >= 192 && value[i] <= 198 && buffer.length > 30) {
              headerFound = false;
              this.decodeChunk(buffer);

              // Reset buffer for the next chunk
              buffer = [];
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading data:", error);
    }
  }

  decodeChunk(chunk) {
    // Skip first byte (header) and last byte (stop byte)
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];
    this.data["sampleNumber"].push(sampleNumber);
    this.data["timestamp"].push(new Date().getTime());

    // Parse EEG data for all channels
    const eegData = [];
    console.log("Current mode: ", this.mode);

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        this.interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) / 24;
      const channelName = `A${Math.ceil((i - 1) / 3)}`;
      this.data[channelName].push(channelData);
      eegData.push(channelData);
    }
    if (chunk[-1] === 192) {
      for (let i = 0; i < 6; i++) {
        const auxMapping = ["AX1", "AX0", "AY1", "AY0", "AZ1", "AZ0"];

        let byteIndex = 27 + i; // Calculate the starting index for each pair of bytes

        let auxData =
          this.interpret16bitAsInt32(chunk.slice(byteIndex, byteIndex + 2)) *
          0.000125;

        let auxChannel = auxMapping[i / 2];

        try {
          this.data[auxChannel].push(auxData);
        } catch (e) {
          console.log(e);
          console.log(JSON.stringify(this.data));
        }
      }
    }
  }
  decodeDaisy(chunk) {
    let odd = chunk[1] % 2 !== 0;
    let channelName;
    // Skip first byte (header) and last byte (stop byte)
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];
    this.data["sampleNumber"].push(sampleNumber);
    this.data["timestamp"].push(new Date().getTime());

    // Parse EEG data for all channels
    const eegData = [];
    // console.log("Current mode: ", this.mode);

  

      
    let Acc0 = this.interpret16bitAsInt32(chunk.slice(26,28)) * 0.000125;
    let Acc1 = this.interpret16bitAsInt32(chunk.slice(28,30)) * 0.000125;
    let Acc2 = this.interpret16bitAsInt32(chunk.slice(30,32)) * 0.000125;
       
      

      try {
        this.data["Accel0"].push(Acc0);
        this.data["Accel1"].push(Acc1);
        this.data["Accel2"].push(Acc2);
      } catch (e) {
        console.log(e);
        console.log(JSON.stringify(this.data));
      }
    

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        this.interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) *0.02235;
      if (odd) {
        channelName = `A${Math.ceil((i - 1) / 3)}`;
        this.odd = false;
      } else {
        channelName = `A${Math.ceil((i - 1) / 3) + 8}`;
        this.odd = true;
      }
      try {
        // normally twice, because it has to be upsampled to 250SPS (https://docs.openbci.com/Cyton/CytonDataFormat/#16-channel-data-with-daisy-mdule)
        // in this case just once, because we use 125SPS
        this.data[channelName].push(channelData);

        // console.log("debug");
      } catch (e) {
        console.log(e);
        console.log(JSON.stringify(this.data));
      }
      eegData.push(channelData);
    }
  }

  getData() {
    return this.data;
  }
  async stopReading(participantNumber) {
    this.endRecording = this.getReadableTimestamp();

    try {
      // Check if the port is writable before writing data
      if (this.port && this.port.writable) {
        const writer = this.port.writable.getWriter();
        const command = "s"; // Command to stop recording
        const commandBytes = new TextEncoder().encode(command);
        await writer.write(commandBytes);
        console.log("Recording stopped");
        writer.releaseLock();
        console.log(this.data);
        this.data.count = this.data.A1.length;
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
    const objectKeys = Object.keys(this.data);
    this.exportCSV(this.data, objectKeys, participantNumber);
    this.data = {
      count: "",
      sampleNumber: [],
      timestamp: [],
      A1: [],
      A2: [],
      A3: [],
      A4: [],
      A5: [],
      A6: [],
      A7: [],
      A8: [],
      A9: [],
      A10: [],
      A11: [],
      A12: [],
      A13: [],
      A14: [],
      A15: [],
      A16: [],
      Accel0: [],
      Accel1: [],
      Accel2: [],
    };
  }

  exportCSV(content, objectKeys, participantNumber) {
    const csvContent = this.parseAndExportData(content, objectKeys);
    let startTime = Math.floor(new Date(this.startRecording).getTime() / 1000);
    const fileName = `${participantNumber}-${startTime}.csv`;

    const formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("csvContent", csvContent);

    fetch("/api/save-csv", {
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

  async stopImpedance(channel) {
    try {
      // Check if the port is writable before writing data
      if (this.port && this.port.writable) {
        const writer = this.port.writable.getWriter();
        const command = "s"; // Command to stop recording
        const commandBytes = new TextEncoder().encode(command);
        await writer.write(commandBytes);
        console.log("Recording stopped");
        writer.releaseLock();
        console.log("finished rec: " + this.data[channel]);
        this.data.count = this.data[channel].length;
        // Prepare data to send
        let raw_data = this.data[channel].map((value) => parseFloat(value)); // Convert values to floats if necessary
        if (raw_data.length > 300) {
          raw_data = raw_data
            .slice(raw_data.length - 300)
            .filter((value) => value !== null);
        }
        if (this.mode === "daisy") {
          this.sps = 125;
        } else {
          this.sps = 250;
        }
        // Send data to http://localhost:5001/calculate_impedance
        const response = await fetch("/data/calculate_impedance/" + this.sps, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data_raw: raw_data }),
        });
        console.log("Data sent to calculate impedance:", raw_data);
        const impedanceValue = await response.json(); // Get impedance value from the response
        this.impedance[channel] = impedanceValue.impedance; // Store impedance value in the global variable
        console.log(
          "Impedance value for channel " + channel + ":",
          impedanceValue.impedance
        );
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }

    this.data = {
      count: "",
      sampleNumber: [],
      timestamp: [],
      A1: [],
      A2: [],
      A3: [],
      A4: [],
      A5: [],
      A6: [],
      A7: [],
      A8: [],
      A9: [],
      A10: [],
      A11: [],
      A12: [],
      A13: [],
      A14: [],
      A15: [],
      A16: [],
      Accel0: [],
      Accel1: [],
      Accel2: [],
    };
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
  parseAndExportImpedance(data, objectKeys) {
    const headers = `Index;Datetime;${objectKeys.join(";")}`;

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

    // Add index and current timestamp
    const timestamp = new Date().toISOString();
    const firstRow = `1;${timestamp};${filledData
      .map((arr) => arr[0])
      .join(";")}`;
    const remainingRows = [];
    for (let i = 1; i < maxLength; i++) {
      const rowData = filledData.map((arr) => arr[i]);
      remainingRows.push(rowData.join(";"));
    }

    // Combine rows with newline characters
    const csvContent =
      headers + "\n" + firstRow + "\n" + remainingRows.join("\n");

    return csvContent;
  }

  async setupSerialAsync() {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 }); // Set baud rate to 115200
      this.reader = this.port.readable.getReader();
      this.connected = true;
      this.readData();
    } catch (error) {
      console.error("Error connecting to serial port:", error);
    }
  }
}
// At the end of cyton.js
