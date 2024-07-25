from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS extension
import numpy as np
from scipy.signal import butter, filtfilt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

processing_band_low_Hz = [27]
processing_band_high_Hz = [37]

class GenericButterBand:
    def __init__(self, lowcut, highcut, fs, order=4):  # Changed order to 3
        nyq = 0.5 * fs
        low = lowcut / nyq
        high = highcut / nyq
        self.b, self.a = butter(order, [low, high], btype='band')

    def __call__(self, data):
        return filtfilt(self.b, self.a, data)


def filter_multiple_bands(data, fs, lowcut, highcut):
    # Ensure the filtered_data array has dtype float64
    filtered_data = np.zeros_like(data, dtype=np.float64)
    for low, high in zip(lowcut, highcut):
        band_filter = GenericButterBand(low, high, fs)
        filtered_data += band_filter(data)
    return filtered_data


def filter_impedance(data_raw, fs):
    data_filtered = filter_multiple_bands(data_raw, fs, lowcut=processing_band_low_Hz, highcut=processing_band_high_Hz)
    return data_filtered

def process_data_packets(data_raw, fs):
    packet_length = int(125)  # Packet length based on sample rate
    num_packets = len(data_raw) // packet_length
    processed_packets = []

    for i in range(num_packets):
        start_idx = i * packet_length
        end_idx = start_idx + packet_length
        packet = data_raw[start_idx:end_idx]
        if len(packet) == packet_length:
            filtered_data = filter_impedance(packet, fs)
            stdUv = np.std(filtered_data)
            impedance = get_z(stdUv)
            processed_packets.append(impedance)
            print(f'Packet {i+1}: Impedance = {impedance}')
    return processed_packets

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

    # Convert data_raw to numpy array with float64 dtype
    data_raw = np.array(data_raw, dtype=np.float64)
    
    processed_packets = process_data_packets(data_raw, fs)
    
    if len(processed_packets) > 0:
        last_impedance = processed_packets[-1]
    else:
        last_impedance = 0
    # Calculate the average impedance of the last two packets
    avg_impedance_last_two = last_impedance
    print(f'Average impedance of the last two packets: {avg_impedance_last_two} KOhm')
    return jsonify({
        'impedance': avg_impedance_last_two
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
