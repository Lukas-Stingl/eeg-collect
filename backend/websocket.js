const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const url = require("url");

const port = process.env.PORT || 3001;
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
  console.log(`mode: ${mode} participant: ${participant}`);

  if (!participant) {
    console.error("Invalid participant identifier");
    ws.close();
    return;
  }

  const startTime = Math.floor(new Date().getTime() / 1000);
  const fileName = `${participant}-${startTime}-Recording.csv`;
  const filePath = path.join(RECORDINGS_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);
  if (mode === "daisy") {
    // Write the CSV header
    writeStream.write(
      "Index;Datetime;sampleNumber;timestamp;A1;A2;A3;A4;A5;A6;A7;A8;A9;A10;A11;A12;A13;A14;A15;A16;Accel0;Accel1;Accel2\n",
    );
  } else if (mode === "cyton") {
    // Write the CSV header
    writeStream.write(
      "Index;Datetime;sampleNumber;timestamp;A1;A2;A3;A4;A5;A6;A7;A8;Accel0;Accel1;Accel2\n",
    );
  }
  let index = 0;
  let previousData = null;

  ws.on("message", (message) => {
    if (message.toString() === "heartbeat") {
      return;
    } else {
      let data;
      if (mode === "daisy") {
        data = decodeDaisyData(message);
        if (data) {
          if (data.sampleNumber % 2 === 0) {
            // Combine with previous odd sample
            if (
              previousData &&
              previousData.sampleNumber === data.sampleNumber - 1
            ) {
              const combinedData = {
                ...previousData,
                ...data,
              };
              index += 1;
              const datetime = new Date(
                combinedData.timestamp,
              ).toLocaleString();
              const csvRow = `${index};${datetime};${combinedData.sampleNumber};${combinedData.timestamp};${combinedData.A1};${combinedData.A2};${combinedData.A3};${combinedData.A4};${combinedData.A5};${combinedData.A6};${combinedData.A7};${combinedData.A8};${combinedData.A9};${combinedData.A10};${combinedData.A11};${combinedData.A12};${combinedData.A13};${combinedData.A14};${combinedData.A15};${combinedData.A16};${combinedData.Accel0};${combinedData.Accel1};${combinedData.Accel2}\n`;
              writeStream.write(csvRow);
              previousData = null; // Reset for next pair
            }
          } else {
            // Store odd sample data
            previousData = data;
          }
        }
      } else if (mode === "cyton") {
        data = decodeCytonData(message);
        if (data) {
          index += 1;
          const datetime = new Date(data.timestamp).toLocaleString();
          const csvRow = `${index};${datetime};${data.sampleNumber};${data.timestamp};${data.A1};${data.A2};${data.A3};${data.A4};${data.A5};${data.A6};${data.A7};${data.A8};${data.Accel0};${data.Accel1};${data.Accel2}\n`;
          writeStream.write(csvRow);
        }
      } else {
        // Store odd sample data
        previousData = data;
      }
    }
  });

  ws.on("close", () => {
    writeStream.end();
    console.log(`WebSocket connection closed for participant: ${participant}`);
  });

  const decodeDaisyData = (message) => {
    const str = message.toString();
    const numbers = str.split(",").map(Number);

    const chunk = new Uint8Array(numbers);
    const odd = chunk[1] % 2 !== 0;
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];

    const data = {
      sampleNumber,
      timestamp: new Date().getTime(),
      Accel0: 0,
      Accel1: 0,
      Accel2: 0,
    };

    if (chunk[chunk.length - 1] === 192) {
      data.Accel0 = interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125;
      data.Accel1 = interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125;
      data.Accel2 = interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125;
    }

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
      const channelName = `A${Math.ceil((i - 1) / 3) + (odd ? 0 : 8)}`;
      data[channelName] = channelData;
    }

    return data;
  };

  const decodeCytonData = (message) => {
    const str = message.toString();
    const numbers = str.split(",").map(Number);

    const chunk = new Uint8Array(numbers);
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];
    const data = {
      sampleNumber,
      timestamp: new Date().getTime(),
      Accel0: interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125,
      Accel1: interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125,
      Accel2: interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125,
    };

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
      const channelName = `A${Math.ceil((i - 1) / 3)}`;
      data[channelName] = channelData;
    }

    return data;
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

  if ((newInt & 0x00800000) > 0) {
    newInt |= 0xff000000;
  } else {
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
