import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


# Step 2: Load CSV Data
# Assuming your CSV file is named 'data.csv' and the column you're interested in is named 'column_name'
data = pd.read_csv('./backend/recordings/LukasTestLocal-NaN.csv', delimiter=';', decimal=',')
column_data = data['A2']
column_data_list = column_data.astype(float).tolist()
print(column_data_list)
# Step 3: Perform FFT
sampling_freq = 250  # Sampling frequency is 250 Hz
fft_result = np.fft.fft(column_data)
freqs = np.fft.fftfreq(len(column_data), 1/sampling_freq)  # Frequency axis up to Nyquist frequency

# Filter frequencies between 0 Hz and 60 Hz
indices = np.where((freqs >= 5) & (freqs <= 60))
filtered_freqs = freqs[indices]
filtered_fft_result = fft_result[indices]
# Step 4: Plot the FFT
plt.figure(figsize=(10, 6))
plt.plot(filtered_freqs, np.abs(filtered_fft_result))
plt.title('FFT Plot (Frequency Range: 0 Hz - 60 Hz)')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Amplitude')
plt.grid(True)
plt.show()



