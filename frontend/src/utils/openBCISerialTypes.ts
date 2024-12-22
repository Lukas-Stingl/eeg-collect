export type AugmentedNullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

export type AugmentedPartial<T extends {}, K extends keyof T> = Partial<
  Pick<T, K>
> &
  Omit<T, K>;

export type OpenBCISerialData = {
  count: number;
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

export type OpenBCICytonData = {
  count: string;
  sampleNumber: number[];
  timestamp: any[];
  A1: number[];
  A2: number[];
  A3: number[];
  A4: number[];
  A5: number[];
  A6: number[];
  A7: number[];
  A8: number[];
  A9: number[];
  A10: number[];
  A11: number[];
  A12: number[];
  A13: number[];
  A14: number[];
  A15: number[];
  A16: number[];
  Accel0: number[];
  Accel1: number[];
  Accel2: number[];
};

export const OPEN_BCI_CYTON_DATA_DEFAULT_VALUE: OpenBCICytonData = {
  count: "",
  sampleNumber: [],
  timestamp: [],
  A1: [],
  A2: [],
  A3: [],
  A4: [],
  A5: [],
  A6: [],
  A7: [],
  A8: [],
  A9: [],
  A10: [],
  A11: [],
  A12: [],
  A13: [],
  A14: [],
  A15: [],
  A16: [],
  Accel0: [],
  Accel1: [],
  Accel2: [],
};

export type SerialDataRMS = Omit<
  AugmentedPartial<OpenBCISerialData, keyof OpenBCISerialData>,
  | "Accel0"
  | "Accel1"
  | "Accel2"
  | "sampleNumber"
  | "count"
  | "channelName"
  | "timestamp"
>;

export const DEFAULT_OPEN_BCI_SERIAL_DATA: OpenBCISerialData = {
  count: 0,
  sampleNumber: 0,
  timestamp: Date.now(),
  channelName: 0,
  A1: 0,
  A2: 0,
  A3: 0,
  A4: 0,
  A5: 0,
  A6: 0,
  A7: 0,
  A8: 0,
  A9: 0,
  A10: 0,
  A11: 0,
  A12: 0,
  A13: 0,
  A14: 0,
  A15: 0,
  A16: 0,
  Accel0: 0,
  Accel1: 0,
  Accel2: 0,
};

export const DEFAULT_OPEN_BCI_SERIAL_DATA_RMS: SerialDataRMS = {
  A1: 0,
  A2: 0,
  A3: 0,
  A4: 0,
  A5: 0,
  A6: 0,
  A7: 0,
  A8: 0,
  A9: 0,
  A10: 0,
  A11: 0,
  A12: 0,
  A13: 0,
  A14: 0,
  A15: 0,
  A16: 0,
};

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
  CONFIGURE_SAMPLING_RATE = "C~~",
  // RESET = "v",
  // DISCONNECT = "d",
  // IMPEDANCE = "z",
}
