export const getSignalState = ({ signal }: { signal?: number }) => {
  if (!signal || signal < 0.5) {
    return 1;
  } else if (signal > 125) {
    return 2;
  } else if (signal > 75) {
    return 3;
  } else {
    return 4;
  }
};
