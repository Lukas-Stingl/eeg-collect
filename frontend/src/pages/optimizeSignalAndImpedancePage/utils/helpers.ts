export const getSignalState = ({ signal }: { signal?: number }) => {
  if (!signal) {
    return 1;
  }

  if (signal < 0.1) {
    return 1;
  } else if (signal > 100) {
    return 2;
  } else {
    return 3;
  }
};
