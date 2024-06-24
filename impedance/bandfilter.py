from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS extension
import numpy as np
from scipy.signal import butter, filtfilt, iirnotch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
processing_band_low_Hz = [27]
processing_band_high_Hz = [37]

class GenericButterBand:
    def __init__(self, lowcut, highcut, fs, order=4):
        nyq = 0.5 * fs
        low = lowcut / nyq
        high = highcut / nyq
        self.b, self.a = butter(order, [low, high], btype='band')

    def __call__(self, data, fs):
        return filtfilt(self.b, self.a, data)

def notch50(data, fs):
    f0 = 50.0  
    Q = 30.0  
    w0 = f0 / (fs / 2)  
    b, a = iirnotch(w0, Q)
    return filtfilt(b, a, data)

def filter_multiple_bands(data, fs, lowcut, highcut):
    filtered_data = np.zeros_like(data)
    for low, high in zip(lowcut, highcut):
        band_filter = GenericButterBand(low, high, fs)
        filtered_data += band_filter(data, fs)
    return filtered_data

def filter_impedance(data_raw, fs):
    data_notch = notch50(data_raw, fs=fs)
    return filter_multiple_bands(data_notch, fs=fs, lowcut=processing_band_low_Hz, highcut=processing_band_high_Hz)

def get_z(rms):
    z = (1e-6 * rms * np.sqrt(2) / 6e-9) - 2200
    if z < 0:
        return 0
    return z / 1000  # Converting to KOhm

@app.route('/calculate_impedance/<int:fs>', methods=['POST'])
def calculate_impedance(fs):
    data_raw = request.json.get('data_raw')
    channel = request.json.get('channel')
    print(f'Channel: {channel}')
    if not data_raw:
        return jsonify({'error': 'No data provided'}), 400

    # Split the data into 5 packets
    packet_size = len(data_raw) // 5
    packets = [data_raw[i * packet_size:(i + 1) * packet_size] for i in range(5)]

    # Ensure the last packet gets the remaining data if there's any left due to integer division
    if len(data_raw) % 5 != 0:
        packets[-1].extend(data_raw[5 * packet_size:])

    impedances = []

    for i, packet in enumerate(packets):
        data_filtered = filter_impedance(packet, fs)
        stdUv = np.std(data_filtered)
        impedance = get_z(stdUv)
        impedances.append(impedance)
        print(f'Impedance of packet {i + 1}: {impedance} KOhm')

    # Calculate the average impedance of the last two packets
    avg_impedance_last_two = np.mean(impedances[-2:])
    print(f'Average impedance of the last two packets: {avg_impedance_last_two} KOhm')
    return jsonify({
        'impedance': avg_impedance_last_two
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
