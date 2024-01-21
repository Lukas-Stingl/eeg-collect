import { cyton } from '../../frontend/src/scripts/cyton.js/index.js';

document.addEventListener("DOMContentLoaded", function() {
    const cytonBoard = new cyton(
        onDecodedCallback,
        onConnectedCallback,
        onDisconnectedCallback,
        '',
        'CustomDecoder',
        115200,
    ); // Instantiate the cyton class

    document.getElementById("connect").addEventListener("click", async function() {
        try {
            await cytonBoard.setupSerialAsync(); // Attempt to connect
            document.getElementById("status").innerText = "Connected to Cyton";
        } catch (error) {
            console.error("Connection failed", error);
            document.getElementById("status").innerText = "Connection Failed";
        }
    });

    document.getElementById("receive-data").addEventListener("click", function() {
        // Assuming getLatestData is properly implemented and returns the latest data
        let dataDisplay = document.getElementById("data-display");
        dataDisplay.innerHTML = ""; // Clear previous data

        // Fetch and display data from channels A0 to A8
        for (let channel of ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']) {
            let data = cytonBoard.getLatestData(channel, 1); // Get latest data for each channel
            let dataString = `Channel ${channel}: ${data}<br>`; // Create a string representation
            dataDisplay.innerHTML += dataString; // Append the string to the data display
        }
    });
    document.getElementById('start-recording').addEventListener('click', async () => {
        try {
            // Ensure the port is opened and start reading
            await cytonBoard.startReading();
        } catch (error) {
            console.error('Error starting recording:', error);
            // Handle errors related to starting recording here
        }

    });
    document.getElementById('stop-recording').addEventListener('click', async () => {
        await cytonBoard.stopReading();
        
    });
});





// You'll need to implement these callback functions or ensure they are passed into the constructor
function onDecodedCallback(newLinesInt) {
    // Handle new decoded data here
}

function onConnectedCallback() {
    // Handle successful connection here
}

function onDisconnectedCallback() {
    // Handle disconnection here
}
