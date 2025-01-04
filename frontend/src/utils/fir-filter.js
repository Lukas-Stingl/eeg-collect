// Function that mirrors the signal at the edges to avoid edge artefacts
// As in mne python filter_data() the padding width is set to filterLength-1 = filterOrder
import Fili from "fili/index";

function reflectLimitedPadding(signal, padLength) {
  // Reflect the start of the signal
  const reflectedStart = signal
    .slice(0, padLength) // Take the first 'padLength' elements
    .reverse(); // Reverse to reflect

  // Reflect the end of the signal
  const reflectedEnd = signal
    .slice(-padLength) // Take the last 'padLength' elements
    .reverse(); // Reverse to reflect

  // Add zeros - excluded for now;
  // Would have to take a closer look at how mne python does it in filter_data()
  // const zeroPadding = Array(padLength).fill(0);

  // Concatenate to form the padded signal
  return [
    ...reflectedStart, // Start padding
    ...signal, // Original signal
    ...reflectedEnd, // End padding
    // ...zeroPadding     // Trailing zeros
  ];
}

// For instructions see https://github.com/markert/fili.js/
export function filter_setup(fs, filterOrder) {
  // Instance of a filter coefficient calculator
  var firCalculator = new Fili.FirCoeffs();

  // Calculate filter coefficients
  var firFilterCoeffs = firCalculator.highpass({
    // can also be bandpass with F1 & F2
    order: filterOrder, // Filter order
    Fs: fs, // Sampling frequency
    Fc: 1, // cutoff frequency
    // forbandpass and bandstop F1 and F2 must be provided instead of Fc
  });

  // Create a filter instance from the calculated coefficients
  return new Fili.FirFilter(firFilterCoeffs);
}

export function filter_signal(signalArray, filterOrder, firFilter) {
  // Pad the signal on edges - similar to default setting in mne python's filter_data() method for FIR filters.
  var paddedArray = reflectLimitedPadding(signalArray, 250);

  // Apply the FIR filter
  var filteredArray = firFilter.multiStep(paddedArray);

  // Remove padded edge values again
  filteredArray = filteredArray.slice(250, -250);
  // console.log(filteredArray);

  // Subtract baseline (to remove DC offset)
  const signal_mean =
    filteredArray.reduce((sum, value) => sum + value, 0) / filteredArray.length;
  return filteredArray.map((value) => value - signal_mean);
}
