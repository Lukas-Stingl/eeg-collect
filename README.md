# EEG Collect

Application for simplified EEG data collection. If you would like to use this project, please cite this paper: 
Stingl, L., & Knierim, M. T. (2024). OpenBCI meets the web: A scalable, customizable platform for open-source EEG data collection. In Companion of the 2024 ACM International Joint Conference on Pervasive and Ubiquitous Computing (UbiComp Companion ’24) (pp. 1-5). ACM. https://doi.org/10.1145/3675094.3678482

## Overview
EEG Collect addresses critical needs for cross-platform compatibility, customizability, efficient session management, and user-friendly interfaces, making it ideal for large-scale and field studies. The automated data management and real-time feedback enhance data quality and reliability, supporting various research applications.

### Modules:
1. **Vue Frontend**: Creates the user interface.
2. **Node Server**: Saves data as CSV in the root directory.
3. **WebSocket Server**: Creates WebSocket server and interprets raw data into EEG data.
4. **Flask Server**: Calculates impedance based on EEG data.

## Vue Frontend
- **Installation:**
```javascript
cd frontend
npm install
npm run build # For production (serve index.html)
```
or
```bash
npm run serve  # For development
```
## WebSocket Server
- **Installation:**
```bash
cd backend
npm install
node websocket.js
```
## Flask Server
- **Installation:**
```bash
cd impedance
pip install -r requirements.txt
python bandfilter.js
