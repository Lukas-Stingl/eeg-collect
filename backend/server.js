const express = require("express");
const path = require("path");
const cors = require("cors");
const formidable = require("express-formidable");
const fs = require("fs");
const { DataFilter, FilterTypes } = require("brainflow");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(formidable());

app.post("/save-csv", (req, res) => {
  const fileName = req.fields.fileName;
  const csvContent = req.fields.csvContent;

  // Save the CSV content to a file with the provided filename
  fs.writeFile(__dirname + "/recordings/" + fileName, csvContent, (err) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log("File saved");
    res.status(200).json({ message: "File saved successfully" });
  });
});

app.post("/raw-eeg-data", (req, res) => {
  // Array of numbers
  const data = req.fields.data;

  console.log(data);

  data.map((arr) => {
    if (!arr) {
      return;
    }
    DataFilter.performBandPass(
      arr,
      250,
      1.0,
      30.0,
      2,
      FilterTypes.BUTTERWORTH_ZERO_PHASE,
      0,
    );
  });

  console.log(data);

  // Send the filtered data back to the client
  res.status(200).json({ filteredData: data });
});

app.use("/recordings", express.static(path.join(__dirname, "recordings")));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
