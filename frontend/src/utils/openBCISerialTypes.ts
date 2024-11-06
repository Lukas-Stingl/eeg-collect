export type OpenBCISerialData = {
  count: "";
  sampleNumber: number;
  timestamp: number;
  channelName: number;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  A5: number;
  A6: number;
  A7: number;
  A8: number;
  A9: number;
  A10: number;
  A11: number;
  A12: number;
  A13: number;
  A14: number;
  A15: number;
  A16: number;
  Accel0: number;
  Accel1: number;
  Accel2: number;
};

export type AugmentedNullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

export type AugmentedPartial<T extends {}, K extends keyof T> = Partial<
  Pick<T, K>
> &
  Omit<T, K>;

export enum RecordingMode {
  RECORDING = "recording",
  IMPEDANCE = "impedance",
}

export enum ConnectedDeviceStatus {
  DONGLE_CONNECTED_BUT_HEADSET_NOT_FOUND = "dongle_connected_but_headset_not_found",
  SUCCESS = "success",
  NO_DATA_STREAMED = "no_data_streamed",
}

export enum CytonBoardCommands {
  START_STREAMING = "b",
  STOP_STREAMING = "s",
  // RESET = "v",
  // DISCONNECT = "d",
  // IMPEDANCE = "z",
}
