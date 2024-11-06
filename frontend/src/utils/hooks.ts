import { useStore } from "@/store";
import { useRoute } from "vue-router";
import { isEmpty } from "lodash";
import { Store } from "vuex";

import {
  decodeCytonData,
  getEncodedCytonCommand,
  getReadableTimestamp,
  logErrorDetails,
  URL_PARAMS,
  URLs,
} from "@/utils/helpers";
import { computed, ref, watch } from "vue";
import CHANNEL_ASSIGNMENT from "@/config/channelAssignment.json";
import { ConnectionMode, State } from "@/store/utils/storeTypes";
import { CHECK_CONNECTED_DEVICE_STATUS } from "@/scripts/cyton";
import {
  AugmentedPartial,
  ConnectedDeviceStatus,
  CytonBoardCommands,
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
  const ws = computed(() => store.state.webSocket);

  const mode = computed(() => store.state.mode);
  const port = computed(() => store.state.webSerial.port);
  const reader = computed(() => store.state.webSerial.reader);
  const recordingMode = ref<RecordingMode>(RecordingMode.RECORDING);
  const startRecordingTime = ref<string>("");
  const isRecording = ref<boolean>(false);

  // ---- EXPORTED METHODS ----

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

      store.commit("setWebSerialReader", { reader: reader });

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

      // TODO Wenn die App Unmounted, Reader releasen. Aber nicht hier!!!
    }
  };

  const stopRecording = async () => {
    console.log("1010101010101010101010101010101010101010101010101010101010");
    isRecording.value = false;

    try {
      // Check if the port is writable before writing data
      if (port.value && port.value.writable) {
        console.log("ABABABABABABABABABABABABABABABABABABAB");
        const writer = port.value.writable.getWriter();

        await writer.write(
          getEncodedCytonCommand(CytonBoardCommands.STOP_STREAMING),
        );
        console.log("Cyton Streaming stopped");
        writer.releaseLock();
        // console.log(this.data);
        // this.data.count = this.data.A1.length;
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  // Wie readData() in cyton.js
  const startSignalQualityCheck = async () => {
    isRecording.value = true;

    let buffer: any[] = []; // Buffer to accumulate bytes until a complete chunk is formed
    let headerFound = false;
    let lastDataTimestamp = Date.now();
    let timeoutId: number;

    watch(isRecording, (newValue) => {
      console.log(
        "isRecording changed to false, stopping the loop: " + newValue,
      );
    });

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (Date.now() - lastDataTimestamp >= 10000 && isRecording.value) {
          console.log(
            "no new data received since 10 seconds, restarting stream",
          );
          commandBoardStartStreamingData();
        }
      }, 10000);
    };

    // Start the initial timeout check
    resetTimeout();
    // let stop = false;

    // TODO Hier noch checken ob der reader nicht closed ist. Wenn ja, return, sonst gibts eine endlosschleife
    while (isRecording.value) {
      const { value, done } = await readFromStream();

      //console.log("New pair for value, done received.");
      // console.log(isRecording.value);
      // console.log(value);

      if (done) {
        console.log("Stream disconnected, checking status");
        if (isRecording.value) {
          console.log("Stream disconnected, attempting to reconnect");
          continue;
        } else {
          console.log("Stream disconnected, stopping read");
          if (reader.value) {
            reader.value.releaseLock();
            break;
          }
        }
      }

      lastDataTimestamp = Date.now(); // Update timestamp on new data
      resetTimeout();

      // Process received chunk
      if (value) {
        for (let i = 0; i < value.length; i++) {
          try {
            // Check if the header is found
            if (!headerFound && value[i] === 160) {
              headerFound = true;
            } else if (!headerFound && !headerFound) {
              const text = new TextDecoder().decode(value);
              // console.log(text);
            }

            if (headerFound) {
              buffer.push(value[i]);
            }
          } catch (error) {
            // console.error("Error in first part of for loop:", error);
            // logErrorDetails(error, buffer, isRecording.value);
          }

          try {
            // Check if a complete chunk is formed
            // Decode the chunk
            // Stop receiving data if the stop byte is found

            if (value[i] >= 192 && value[i] <= 198 && buffer.length > 30) {
              headerFound = false;

              if (mode.value === ConnectionMode.DAISY) {
                // decodeDaisy(buffer);
                console.log("DAISY?");
              } else {
                decodeChunk(buffer);
              }

              // Reset buffer for the next chunk
              buffer = [];
            } else {
              // TODO: I assume this case is not caught: What happens if the above is not executed and the buffer not reset?
              //console.log("Unsure what to do with rest of chunk?")
            }
          } catch (error) {
            // console.error("Error in second part of for loop:", error);
            // logErrorDetails(error, buffer, isRecording.value);
          }
        }
      } else {
        // console.log("Warning: Received null or undefined value from reader.");
        // stop = true;
      }
    }
  };

  // ---- INTERNAL FUNCTIONS ----

  /**
   * Send a complete chunk to the WebSocket Server.
   * @param chunk - The chunk of received EEG data to be sent to the server.
   */
  const decodeChunk = async (chunk: any[]) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      try {
        // @ts-expect-error
        ws.value.send(chunk as ArrayBuffer);
      } catch (err) {
        // console.error("Error sending chunk to WebSocket:", err);
      }
    } else {
      // console.warn("WebSocket not open, chunk not sent.");
    }
  };

  // startReading() in cyton.js
  const commandBoardStartStreamingData = async () => {
    startRecordingTime.value = getReadableTimestamp();
    try {
      // Check if the port is writable before writing data
      if (port.value && port.value.writable) {
        const writer = port.value.writable.getWriter();
        let command = "b"; // Command to start recording
        let commandBytes = new TextEncoder().encode(command);
        await writer.write(commandBytes);

        command = "C~~"; // Command to start recording
        commandBytes = new TextEncoder().encode(command);
        await writer.write(commandBytes);
        console.log("Recording started");
        isRecording.value = true;

        writer.releaseLock();
      } else {
        console.error("Serial port is not writable");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const checkConnectedDevice = async (store: Store<State>) => {
    console.log(store);
    const reader = store.getters.webSerialReader || {};

    if (!reader) {
      console.error("No reader found");
      return CHECK_CONNECTED_DEVICE_STATUS.NO_DATA_STREAMED;
    }

    console.log("in checkConnectedDevice");
    recordingMode.value = RecordingMode.RECORDING;
    await commandBoardStartStreamingData();
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
    console.log("readFromStream");
    console.log(reader.value);
    try {
      if (!reader.value) {
        console.error("No reader found");
        return { value: null, done: false };
      }
      const { value, done } = await reader.value.read();
      console.log(value);
      return { value, done };
    } catch (err) {
      console.error("Error while reading from stream:", err);
      // console.log(reader.value);
      logReaderStatus();
      return { value: null, done: false }; // Return done as true to stop the loop if there's an error
    }
  };
  const logReaderStatus = () => {
    if (reader.value && reader.value.closed) {
      //console.log("Reader is closed.");
    } else {
      //console.log("Reader is in an unknown state.");
    }
  };

  // ---- RETURN ----

  return { setupSerialConnection, startSignalQualityCheck, stopRecording };
};
