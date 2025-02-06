export const getSignalState = ({ signal }: { signal?: number }) => {
  if (!signal || signal < 0.1) {
    return 1;
  } else if (signal > 300) {
    return 2;
  } else if (signal > 100) {
    return 3;
  } else {
    return 4;
  }
};
