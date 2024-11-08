export const getSignalState = ({ signal }: { signal?: number }) => {
  if (!signal) {
    return 0;
  }

  // TODO I think thresholds and values are different for each node

  if (signal < 30000) {
    return 3;
  } else if (signal < 80000) {
    return 2;
  } else {
    return 1;
  }
};
