export const getSignalState = ({ signal }: { signal?: number }) => {
  if (!signal) {
    return 0;
  }

  // TODO I think thresholds and values are different for each node

  if (signal > 0.9) {
    return 1;
  } else if (signal > 0.6) {
    return 2;
  } else {
    return 3;
  }
};
