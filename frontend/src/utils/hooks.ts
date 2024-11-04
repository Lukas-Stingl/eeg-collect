import { useStore } from "@/store";
import { useRoute } from "vue-router";
import { isEmpty } from "lodash";
import { Store } from "vuex";

import { getReadableTimestamp, URL_PARAMS, URLs } from "@/utils/helpers";
import { computed, ref, watch } from "vue";
import CHANNEL_ASSIGNMENT from "@/config/channelAssignment.json";
import { ConnectionMode, State } from "@/store/utils/storeTypes";
import { CHECK_CONNECTED_DEVICE_STATUS } from "@/scripts/cyton";
import {
  AugmentedPartial,
  ConnectedDeviceStatus,
  OpenBCISerialData,
  RecordingMode,
} from "@/utils/openBCISerialTypes";

export const useConfigureParticipantId = () => {
  const store = useStore();
  const UrlRoute = useRoute();

  const participantId = computed(
    () => UrlRoute.query[URL_PARAMS.participantIdParam],
  );

  if (store.state.participantId) {
    return;
  }

  watch(
    () => participantId.value,
    () => {
      participantId.value
        ? store.commit("setParticipantId", {
            participantId: `${participantId.value}`,
          })
        : store.commit("setParticipantIdModalOpen");
    },
    { immediate: true },
  );
};

export const useWebsocketConnection = (): WebSocket | null => {
  const store = useStore();
  const webSocket = computed(() => store.state.webSocket);
  const participantId = computed(() => store.state.participantId);

  if (webSocket.value) {
    return webSocket.value;
  }

  const UrlRoute = useRoute();
  const channelConfig = computed(
    () => UrlRoute.query[URL_PARAMS.channelConfig],
  );
  const channelAssignment = CHANNEL_ASSIGNMENT[`${channelConfig.value}`] || {};
  const mode =
    Object.keys(channelAssignment).length > 8
      ? ConnectionMode.DAISY
      : ConnectionMode.CYTON;

  if (
    !channelConfig.value ||
    !channelAssignment ||
    !mode ||
    !participantId.value
  ) {
    return null;
  }

  const ws = new WebSocket(
    `${URLs.WEB_SOCKET_URL}${mode}/${participantId.value}/`,
  );

  store.commit("setConnectionMode", { connectionMode: mode });
  store.commit("setWebSocket", { websocket: ws });
  return ws;
};

export const useOpenBCIUtils = () => {
  // ---- STATE ----

  const store = useStore();
  const mode = computed(() => store.state.mode);
  const port = computed(() => store.state.webSerial.port);
  const reader = computed(() => store.state.webSerial.reader);
  const recordingMode = ref<RecordingMode>(RecordingMode.RECORDING);
  const startRecordingTime = ref<string>("");

  // ---- METHODS ----

  const setupSerialConnection = async ({
    setIsLoadingModalShown,
  }: {
    setIsLoadingModalShown: (arg: boolean) => void;
  }): Promise<ConnectedDeviceStatus | boolean> => {
    let returnStatus: ConnectedDeviceStatus | boolean = false;
    try {
      const port: SerialPort = await navigator.serial.requestPort();

      console.log("port:::");
      console.log(port);

      store.commit("setWebSerialPort", { port: port });

      if (setIsLoadingModalShown !== undefined) {
        setIsLoadingModalShown(true);
      }
      await port.open({ baudRate: 115200, bufferSize: 16000 });
      const reader = port.readable.getReader();

      store.commit("setWebSerailReader", { reader: reader });

      const isCorrectDeviceConnected = await checkConnectedDevice(store);

      console.log("isCorrectDeviceConnected");
      console.log(isCorrectDeviceConnected);

      if (isCorrectDeviceConnected === ConnectedDeviceStatus.SUCCESS) {
        console.log("Correct device connected");
        // this.readData();
        returnStatus = ConnectedDeviceStatus.SUCCESS;
      } else if (
        isCorrectDeviceConnected ===
        ConnectedDeviceStatus.DONGLE_CONNECTED_BUT_HEADSET_NOT_FOUND
      ) {
        console.log("Dongle connected but Headset not found");
        returnStatus =
          ConnectedDeviceStatus.DONGLE_CONNECTED_BUT_HEADSET_NOT_FOUND;
      } else {
        console.log("No Data Streamed");
        returnStatus = ConnectedDeviceStatus.NO_DATA_STREAMED;
      }

      return returnStatus;
    } catch (error) {
      console.error("Error connecting to serial port:", error);

      if (port.value && !isEmpty(port.value.getInfo())) {
        console.log("Port Info");
        console.log(port.value.getInfo());
        await port.value.close();
        console.log("Serial port closed due to error");
      }

      if (reader.value && !reader.value.closed) {
        reader.value.releaseLock();
        console.log("Reader released due to error");
      }

      return false;
    } finally {
      if (setIsLoadingModalShown !== undefined) {
        setIsLoadingModalShown(false);
      }

      if (port.value && reader.value) {
        console.log(reader.value);
        reader.value.releaseLock();
        console.log("Reader released");
      }
    }
  };

  const startReading = async () => {
    startRecordingTime.value = getReadableTimestamp();
    try {
      // Check if the port is writable before writing data
      if (port.value && port.value.writable) {
        const writer = port.value.writable.getWriter();
        const command = "b"; // Command to start recording
        const commandBytes = new TextEncoder().encode(command);
        await writer.write(commandBytes);
        console.log("Recording started");

        writer.releaseLock();
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // ---- HELPER FUNCTIONS ----

  const checkConnectedDevice = async (store: Store<State>) => {
    console.log(store);
    const reader = store.getters.webSerialReader || {};

    if (!reader) {
      console.error("No reader found");
      return CHECK_CONNECTED_DEVICE_STATUS.NO_DATA_STREAMED;
    }

    console.log("in checkConnectedDevice");
    recordingMode.value = RecordingMode.RECORDING;
    await startReading();
    let buffer = ""; // stores decoded text messages.
    const checkChunkBuffer = []; // Buffer to accumulate bytes until a complete chunk is formed
    let isCheckChunkChecked = false;

    console.log("S");

    // Start the initial timeout check
    while (!isCheckChunkChecked) {
      console.log("W");
      console.log("3333");
      const { value, done }: { value: any; done: boolean } =
        await Promise.race<{ value: any; done: boolean }>([
          readFromStream(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000),
          ),
        ]).catch(() => ({ value: null, done: true }));

      console.log("New pair for value, done received.");
      console.log(value);

      if (value) {
        const decodedValue = new TextDecoder().decode(value);
        buffer += decodedValue;
        console.log(decodedValue);

        for (let i = 0; i < value.length; i++) {
          checkChunkBuffer.push(value[i]);
        }

        if (
          buffer.includes(
            "Failure: Communications timeout - Device failed to poll Host$$$",
          )
        ) {
          console.log(
            "Correct Port Selected but Headset was not detected. Please turn your headset on.",
          );
          reader.releaseLock();
          return CHECK_CONNECTED_DEVICE_STATUS.DONGLE_CONNECTED_BUT_HEADSET_NOT_FOUND;
        }
      }

      // ---- START HELPER FUNCTIONS

      const decodeCytonData = (message: any[]) => {
        const str = message.toString();
        const numbers = str.split(",").map(Number);

        const chunk = new Uint8Array(numbers);
        const byteArray = chunk.slice(1, -1);
        const sampleNumber = chunk[1];
        let data: AugmentedPartial<
          OpenBCISerialData,
          keyof Omit<
            OpenBCISerialData,
            "sampleNumber" | "timestamp" | "Accel0" | "Accel1" | "Accel2"
          >
        > = {
          sampleNumber: sampleNumber,
          timestamp: new Date().getTime(),
          Accel0: interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125,
          Accel1: interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125,
          Accel2: interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125,
        };

        for (let i = 2; i <= 24; i += 3) {
          const channelData =
            interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
          const channelName = `A${Math.ceil((i - 1) / 3)}`;
          data = { ...data, channelName: channelData };
        }

        return data;
      };

      const interpret24bitAsInt32 = (byteArray: Uint8Array) => {
        if (byteArray.length !== 3) {
          throw new Error("Byte array must have exactly 3 elements");
        }

        let newInt =
          ((0xff & byteArray[0]) << 16) |
          ((0xff & byteArray[1]) << 8) |
          (0xff & byteArray[2]);

        if ((newInt & 0x00800000) > 0) {
          newInt |= 0xff000000;
        } else {
          newInt &= 0x00ffffff;
        }

        return newInt;
      };

      const interpret16bitAsInt32 = (byteArray: Uint8Array) => {
        let newInt = ((0xff & byteArray[0]) << 8) | (0xff & byteArray[1]);

        if ((newInt & 0x00008000) > 0) {
          newInt |= 0xffff0000;
        } else {
          newInt &= 0x0000ffff;
        }

        return newInt;
      };

      // ---- END HELPER FUNCTIONS

      if (!value) {
        console.log("No value streamed. Possibly wrong port selected.");
        reader.releaseLock();
        return CHECK_CONNECTED_DEVICE_STATUS.NO_DATA_STREAMED;
      }

      for (let i = 0; i < value.length; i++) {
        // If chunk is full
        if (
          value[i] >= 192 &&
          value[i] <= 198 &&
          checkChunkBuffer.length > 30
        ) {
          const data = decodeCytonData(checkChunkBuffer);
          if (data) {
            console.log("data");
            console.log(data);
            // TODO Analyze if Data is believably from an eeg headset.
          }

          isCheckChunkChecked = true;
          return CHECK_CONNECTED_DEVICE_STATUS.SUCCESS;
        }
      }

      if (done) {
        console.log("Stream disconnected, stopping read");
        reader.releaseLock();
        break;
      }
    }
  };

  const readFromStream = async () => {
    try {
      if (!reader.value) {
        console.error("No reader found");
        return { value: null, done: false };
      }
      const { value, done } = await reader.value.read();
      return { value, done };
    } catch (err) {
      console.error("Error while reading from stream:", err);
      console.log(reader.value);
      logReaderStatus();
      return { value: null, done: false }; // Return done as true to stop the loop if there's an error
    }
  };
  const logReaderStatus = () => {
    if (reader.value && reader.value.closed) {
      console.log("Reader is closed.");
    } else {
      console.log("Reader is in an unknown state.");
    }
  };

  return { setupSerialConnection, startReading };
};
