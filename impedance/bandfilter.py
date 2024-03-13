from flask import Flask, request, jsonify
import numpy as np
from scipy.signal import butter, filtfilt, iirnotch

app = Flask(__name__)

processing_band_low_Hz = [1, 4, 8, 13, 30]
processing_band_high_Hz = [4, 8, 13, 30, 55]

class GenericButterBand:
    def __init__(self, lowcut, highcut, fs, order=4):
        nyq = 0.5 * fs
        low = lowcut / nyq
        high = highcut / nyq
        self.b, self.a = butter(order, [low, high], btype='band')

    def __call__(self, data, fs):
        return filtfilt(self.b, self.a, data)

def notch60(data, fs):
    f0 = 60.0  
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

def filter_impedance(data_raw):
    fs = 250  
    data_notch = notch60(data_raw, fs=fs)
    return filter_multiple_bands(data_notch, fs=fs, lowcut=processing_band_low_Hz, highcut=processing_band_high_Hz)

def get_z(rms):
    z = (1e-6 * rms * np.sqrt(2) / 6e-9) - 2200
    if z < 0:
        return 0
    return z / 1000  # Converting to KOhm

@app.route('/calculate_impedance', methods=['POST'])
def calculate_impedance():
    data_raw = request.json.get('data_raw')
    if not data_raw:
        return jsonify({'error': 'No data provided'}), 400
    
    data_filtered = filter_impedance(data_raw)
    stdUv = np.std(data_filtered)
    impedance = get_z(stdUv)
    
    return jsonify({'impedance': impedance})

if __name__ == '__main__':
    app.run(debug=True)