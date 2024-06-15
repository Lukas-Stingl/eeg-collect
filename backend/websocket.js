const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const url = require("url");

const port = process.env.PORT || 3000;
const RECORDINGS_DIR = path.join(__dirname, "recordings");

// Ensure the recordings directory exists
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR);
}

// Create WebSocket server
const server = new WebSocket.Server({ port });

server.on("connection", (ws, req) => {
  console.log("WebSocket connection established");
  const location = url.parse(req.url, true);
  const pathParts = location.pathname.split("/");
  const mode = pathParts[2];
  const participant = pathParts[3]; // Assuming the path is /websocket/participant1
  console.log("mode: " + mode + " participant: " + participant);
  let data = {
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
  // Function to write data to CSV

  ws.on("message", (message) => {
    if (message.toString() === "heartbeat") {
      return;
    } else {
      if (mode === "daisy") {
        decodeDaisyData(message);
      } else if (mode === "cyton") {
        decodeCytonData(message);
      }
    }
  });

  ws.on("close", () => {
    data.count = data.sampleNumber.length;
    if (data.count > 0) {
      writeToCSV(data);
    }
    resetDataObject(data);
    console.log("empty? : " + JSON.stringify(data));
    console.log("WebSocket connection closed");
  });
  decodeDaisyData = (message) => {
    const str = message.toString();
    const numbers = str.split(",").map(Number);

    const chunk = new Uint8Array(numbers);

    let odd = chunk[1] % 2 !== 0;
    let channelName;
    // Skip first byte (header) and last byte (stop byte)
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];

    if (!odd) {
      data["sampleNumber"].push(sampleNumber);
      data["timestamp"].push(new Date().getTime());
    }
    if (chunk[chunk.length - 1] === 192) {
      var Acc0 = interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125;
      var Acc1 = interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125;
      var Acc2 = interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125;
    } else {
      var Acc0 = 0;
      var Acc1 = 0;
      var Acc2 = 0;
    }
    try {
      data["Accel0"].push(Acc0);
      data["Accel1"].push(Acc1);
      data["Accel2"].push(Acc2);
    } catch (e) {
      console.log(e);
    }

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
      if (odd) {
        channelName = `A${Math.ceil((i - 1) / 3)}`;
      } else {
        channelName = `A${Math.ceil((i - 1) / 3) + 8}`;
      }

      // Map the channel data to the channel name in the batch object

      data[channelName].push(channelData);
    }
  };

  decodeCytonData = (message) => {
    const str = message.toString();
    const numbers = str.split(",").map(Number);

    const chunk = new Uint8Array(numbers);
    // Skip first byte (header) and last byte (stop byte)
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];
    data["sampleNumber"].push(sampleNumber);
    data["timestamp"].push(new Date().getTime());

    // Parse EEG data for all channels
    const eegData = [];

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
      const channelName = `A${Math.ceil((i - 1) / 3)}`;
      data[channelName].push(channelData);
      eegData.push(channelData);
    }
    let Acc0 = interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125;
    let Acc1 = interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125;
    let Acc2 = interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125;
    try {
      data["Accel0"].push(Acc0);
      data["Accel1"].push(Acc1);
      data["Accel2"].push(Acc2);
    } catch (e) {
      console.log(e);
    }
  };
  const writeToCSV = (data) => {
    const startTime = Math.floor(
      new Date(data["timestamp"][0]).getTime() / 1000
    );
    const fileName = `${participant}-${startTime}-Recording.csv`;
    const objectKeys = Object.keys(data);
    const csvContent = parseAndExportData(data, objectKeys);
    const formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("csvContent", csvContent);
    fs.writeFile(__dirname + "/recordings/" + fileName, csvContent, (err) => {
      if (err) {
        console.error("Error:", err);
      }
      console.log("File saved");
    });
  };

  const parseAndExportData = (data, objectKeys) => {
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
  };
  const resetDataObject = (data) => {
    data.count = "";
    data.sampleNumber = [];
    data.timestamp = [];
    data.A1 = [];
    data.A2 = [];
    data.A3 = [];
    data.A4 = [];
    data.A5 = [];
    data.A6 = [];
    data.A7 = [];
    data.A8 = [];
    data.A9 = [];
    data.A10 = [];
    data.A11 = [];
    data.A12 = [];
    data.A13 = [];
    data.A14 = [];
    data.A15 = [];
    data.A16 = [];
    data.Accel0 = [];
    data.Accel1 = [];
    data.Accel2 = [];
  };
});

function interpret24bitAsInt32(byteArray) {
  if (byteArray.length !== 3) {
    throw new Error("Byte array must have exactly 3 elements");
  }

  let newInt =
    ((0xff & byteArray[0]) << 16) |
    ((0xff & byteArray[1]) << 8) |
    (0xff & byteArray[2]);

  // Check the sign bit (24th bit in this case)
  if ((newInt & 0x00800000) > 0) {
    // If the sign bit is set, extend the sign to the 32-bit integer
    newInt |= 0xff000000;
  } else {
    // Else, ensure the integer is within 24-bit range
    newInt &= 0x00ffffff;
  }

  return newInt;
}
function interpret16bitAsInt32(byteArray) {
  let newInt = ((0xff & byteArray[0]) << 8) | (0xff & byteArray[1]);

  if ((newInt & 0x00008000) > 0) {
    newInt |= 0xffff0000;
  } else {
    newInt &= 0x0000ffff;
  }

  return newInt;
}

console.log(`WebSocket server is running on ws://localhost:${port}`);
