const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 8081;
const RECORDINGS_DIR = path.join(__dirname, 'recordings');

// Ensure the recordings directory exists
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR);
}

// Create HTTP server for serving static files
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/recordings/')) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/csv' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    var data =  {
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

    const str = message.toString();
    const numbers = str.split(',').map(Number);

    const chunk = new Uint8Array(numbers);
    
    let odd = chunk[1] % 2 !== 0;
    let channelName;
    // Skip first byte (header) and last byte (stop byte)
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];

  
    data["sampleNumber"].push(sampleNumber);
    data["timestamp"].push(new Date().getTime());
  
    // let Acc0 = this.interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125;
    // let Acc1 = this.interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125;
    // let Acc2 = this.interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125;
  
    try {
      // this.data["Accel0"].push(Acc0);
      // this.data["Accel1"].push(Acc1);
      // this.data["Accel2"].push(Acc2);
    } catch (e) {
      console.log(e);
      console.log(JSON.stringify(this.data));
    }
  
    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
      if (odd) {
        channelName = `A${Math.ceil((i - 1) / 3)}`;
        odd = false;
      } else {
        channelName = `A${Math.ceil((i - 1) / 3) + 8}`;
        odd = true;
      }
  
      // Map the channel data to the channel name in the batch object

      data[channelName].push(channelData);
    }
    console.log(data);
    data =   {
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

    // // Parse the message (assuming it's JSON formatted)
    // const data = JSON.parse(message);
    // const fileName = data.fileName;
    // const csvContent = data.csvContent;

    // // Save the CSV content to a file with the provided filename
    // fs.writeFile(path.join(RECORDINGS_DIR, fileName), csvContent, (err) => {
    //   if (err) {
    //     console.error('Error:', err);
    //     ws.send(JSON.stringify({ error: 'Internal server error' }));
    //     return;
    //   }
    //   console.log('File saved');
    //   ws.send(JSON.stringify({ message: 'File saved successfully' }));
    // });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
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
