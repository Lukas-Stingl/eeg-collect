export const getSignalState = ({ signal }: { signal?: number }) => {
  if (!signal) {
    return 1;
  }

  // TODO I think thresholds and values are different for each node

  if (signal < 0.1) {
    return 1;
  } else if (signal > 35) {
    return 2;
  } else {
    return 3;
  }
};
