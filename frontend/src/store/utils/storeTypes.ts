export type State = {
  participantId: string | null;
  isParticipantIdModalOpen: boolean;
  webSocket: WebSocket | null;
  mode: ConnectionMode | null;
  webSerial: WebSerial;
};

export enum ConnectionMode {
  DAISY = "daisy",
  CYTON = "cyton",
}

export type WebSerial = {
  port?: SerialPort;
  reader?: ReadableStreamDefaultReader<any>;
};
