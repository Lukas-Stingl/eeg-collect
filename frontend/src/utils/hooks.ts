import { useRoute } from "vue-router";
import { isEmpty, throttle } from "lodash";
import { Store } from "vuex";

import { useStore } from "@/store";
import {
  getEncodedCytonCommand,
  getReadableTimestamp,
  interpret16bitAsInt32,
  interpret24bitAsInt32,
  URL_PARAMS,
  URLs,
} from "@/utils/helpers";
import { computed, Ref, ref, watch } from "vue";
import CHANNEL_ASSIGNMENT from "@/config/channelAssignment.json";
import channelAssignment from "@/config/channelAssignment.json";
import { ConnectionMode, State } from "@/store/utils/storeTypes";
import { CHECK_CONNECTED_DEVICE_STATUS } from "@/scripts/cyton";
import {
  ConnectedDeviceStatus,
  CytonBoardCommands,
  DEFAULT_OPEN_BCI_SERIAL_DATA,
  DEFAULT_OPEN_BCI_SERIAL_DATA_RMS,
  OPEN_BCI_CYTON_DATA_DEFAULT_VALUE,
  OpenBCICytonData,
  OpenBCISerialData,
  RecordingMode,
  SerialDataRMS,
} from "@/utils/openBCISerialTypes";
import axios from "axios";
import { filter_setup, filter_signal } from "@/utils/fir-filter";

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

export const useDataVisualization = ({
  rollingBuffer,
}: {
  rollingBuffer: Ref<OpenBCISerialData[]>;
}) => {
  const bandFilteredBuffer = ref<number[][]>([[], [], [], [], [], [], [], []]); //ref<OpenBCISerialData[]>([]);

  watch(
    () => rollingBuffer.value,
    async (newValue) => {
      bandFilteredBuffer.value = (await getBandFilteredData()) ?? [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ];
    },
  );

  const getBandFilteredData = async () => {
    const array: number[][] = [];

    rollingBuffer.value.map((serialData, index) => {
      for (let i = 0; i < 8; i++) {
        if (!array[i]) {
          array[i] = [];
        }
        array[i].push(serialData[`A${i + 1}` as keyof OpenBCISerialData]);
      }
    });
    return await axios
      .post("/api/raw-eeg-data", { data: array })
      .then((response) => {
        // console.log(response);

        const responseData: { filteredData: number[][] } = response.data;
        return responseData.filteredData;
      })
      .catch(function (error: any) {
        console.error(error);
      });
  };

  return bandFilteredBuffer;
};

export const useOpenBCIUtils = () => {
  // ---- STATE ----

  // ---- STATE: APIs ----

  const signalRMS = computed(() => {
    const a = bandPassFilteredSignalsThrottled.value;
    return getThrottledRMS();
  });

  const throttledBuffer = computed<OpenBCISerialData[]>(() => {
    const b = rollingBuffer.value;
    return getThrottledBuffer();
  });

  const isImpedanceCheckRunning = ref<boolean>(false);
  const impedanceCheckChannel = ref<number>(1);
  const impedanceDataRaw = ref<any>({});

  // ---- STATE: Internal ----

  const store = useStore();
  const ws = computed(() => store.state.webSocket);

  const participantId = computed(() => store.state.participantId);

  const mode = computed(() => store.state.mode);
  const port = computed(() => store.state.webSerial.port);
  const reader = computed(() => store.state.webSerial.reader);
  const recordingMode = ref<RecordingMode>(RecordingMode.RECORDING);
  const startRecordingTime = ref<string>("");
  const isRecording = ref<boolean>(false);

  const impedanceRecordingStartTime = ref<string>("");
  const data = ref<OpenBCICytonData>(OPEN_BCI_CYTON_DATA_DEFAULT_VALUE);

  // Buffer storing complete cyton chunks.
  const rollingBuffer = ref<OpenBCISerialData[]>([]);

  const filterObj = ref<any>(filter_setup(250, 824));

  const bandFilteredBufferCached = ref<number[][]>([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);
  function applyHighpassFilter(eegData: number[]) {
    const filteredArray: number[] = filter_signal(
      eegData,
      824,
      filterObj.value,
    );

    // console.log(filteredArray);

    return filteredArray;
  }

  const bandPassFilteredSignalsThrottled = computed<number[][]>(() => {
    const getBandFilteredData = () => {
      const array: number[][] = [];

      throttledBuffer.value.map((serialData, index) => {
        for (let i = 0; i < 8; i++) {
          if (!array[i]) {
            array[i] = [];
          }
          array[i].push(serialData[`A${i + 1}` as keyof OpenBCISerialData]);
        }
      });

      const filteredData: number[][] = [];

      array.map((subArray) => filteredData.push(applyHighpassFilter(subArray)));

      return filteredData;
    };

    bandFilteredBufferCached.value =
      getBandFilteredData() ?? bandFilteredBufferCached.value;

    return bandFilteredBufferCached.value;
  });

  const getThrottledBuffer = throttle(() => {
    return rollingBuffer.value;
  }, 500);

  const nodeRMSsCached = ref<SerialDataRMS>({
    ...DEFAULT_OPEN_BCI_SERIAL_DATA_RMS,
  });
  const getThrottledRMS = throttle(() => {
    //console.log("rollingBuffer.value XXXXXX");
    //console.log(bandPassFilteredSignalsThrottled.value);

    Object.keys(nodeRMSsCached.value).map((AKey, nodeRMSCachedIndex) => {
      bandFilteredBufferCached.value.map((subArray, index) => {
        if (nodeRMSCachedIndex !== index) {
          return;
        }

        if (subArray.length === 0) {
          return;
        }

        // Calculate RMS for each sub-array
        const sumOfSquares = subArray.reduce(
          (sum, value) => sum + value ** 2,
          0,
        );
        const RMS = Math.sqrt(sumOfSquares / subArray.length);
        console.log(AKey);
        console.log(RMS);

        nodeRMSsCached.value[AKey as keyof SerialDataRMS] = RMS;
      });
    });

    //console.log("nodeRMSs");
    //console.log(nodeRMSsCached.value);

    return nodeRMSsCached.value;
  }, 500);

  // ---- METHODS ----

  // ---- METHODS: APIs ----

  const stopRecording = async () => {
    isRecording.value = false;

    try {
      // Check if the port is writable before writing data
      if (port.value && port.value.writable) {
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

  const startRecording = async () => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not open, chunk not sent.");
      return;
    }

    ws.value.send("Setup Finished");
    startSignalQualityCheck();
    await commandBoardStartStreamingData(RecordingMode.SESSION_RECORDING);
  };

  // Wie readData() in cyton.js
  const startSignalQualityCheck = async () => {
    isRecording.value = true;

    let chunkBuffer: any[] = []; // Buffer to accumulate bytes until a complete chunk is formed
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
        if (
          isRecording.value &&
          Date.now() - lastDataTimestamp >= 10000 &&
          isRecording.value
        ) {
          console.log(
            "no new data received since 10 seconds, restarting stream",
          );
          commandBoardStartStreamingData(RecordingMode.SESSION_RECORDING);
        }
      }, 10000);
    };

    // Start the initial timeout check
    resetTimeout();
    // let stop = false;

    // TODO Hier noch checken ob der reader nicht closed ist. Wenn ja, return, sonst gibts eine endlosschleife
    while (isRecording.value) {
      const { value, done } = await readFromStream();

      // console.log("received from stream: ", value);

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

      if (!value) {
        console.log("Warning: Received null or undefined value from reader.");

        continue;
      }

      // Process received chunk
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
            chunkBuffer.push(value[i]);
          }
        } catch (error) {
          // console.error("Error in first part of for loop:", error);
          // logErrorDetails(error, buffer, isRecording.value);
        }

        try {
          // Check if a complete chunk is formed
          // Decode the chunk
          // Stop receiving data if the stop byte is found
          if (value[i] < 192 || value[i] > 198 || chunkBuffer.length <= 30) {
            // TODO: I assume this case is not caught: What happens if the above is not executed and the buffer not reset?
            // console.log("Unsure what to do with rest of chunk?");

            continue;
          }

          headerFound = false;

          if (recordingMode.value === RecordingMode.RECORDING) {
            // ---- RECORDING MODE ----

            switch (mode.value) {
              case ConnectionMode.CYTON: {
                const data = decodeCytonData(chunkBuffer);

                if (data) {
                  // console.log("DATATATATA CHUNK COMPLETE");
                  // console.log(data);
                  if (rollingBuffer.value.length > 1250) {
                    rollingBuffer.value.shift();
                  }

                  rollingBuffer.value = [...rollingBuffer.value, data];
                }
                break;
              }
              case ConnectionMode.DAISY:
                // decodeDaisy(buffer);
                break;
            }

            if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
              console.error("WebSocket not open, chunk not sent.");
              break;
            }

            try {
              //@ts-ignore-next-line
              ws.value.send(chunkBuffer);
            } catch (err) {
              console.error("Error sending chunk to WebSocket:", err);
            }
          } else if (recordingMode.value === RecordingMode.IMPEDANCE) {
            // ---- IMPEDANCE MODE ----

            switch (mode.value) {
              case ConnectionMode.CYTON: {
                decodeChunkImpedance(chunkBuffer);
                break;
              }
              case ConnectionMode.DAISY:
                // decodeDaisy(buffer);
                break;
            }
          } else if (recordingMode.value === RecordingMode.SESSION_RECORDING) {
            // ---- SESSION RECORDING MODE ----

            switch (mode.value) {
              case ConnectionMode.CYTON: {
                if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
                  console.error("WebSocket not open, chunk not sent.");
                  break;
                }

                try {
                  //@ts-ignore-next-line
                  ws.value.send(chunkBuffer);
                } catch (err) {
                  console.error("Error sending chunk to WebSocket:", err);
                }

                break;
              }
              case ConnectionMode.DAISY:
                // decodeDaisy(buffer);
                break;
            }
          }

          chunkBuffer = []; // Reset buffer for the next chunk
        } catch (error) {
          console.error("Error in second part of for loop:", error);
          // logErrorDetails(error, buffer, isRecording.value);
        }
      }
    }
  };

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

      if (!port.readable || !port.writable) {
        await port.open({ baudRate: 115200, bufferSize: 16000 });
      }

      const reader: ReadableStreamDefaultReader<Uint8Array> =
        port.readable.getReader();

      console.log("reader");
      console.log(reader);
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

  const runImpedanceCheck = async () => {
    resetImpedance("H");

    for (let i = 1; i <= 8; i++) {
      console.log("IIIIIIIIIIIIII");
      console.log(i);
      isImpedanceCheckRunning.value = true;
      impedanceCheckChannel.value = i;
      await runImpedanceCheckForChannel(i).then(() => {
        isImpedanceCheckRunning.value = false;
      });
    }

    exportImpedanceCSV();
  };

  const sendAudioSignalStartMessage = async () => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not open, chunk not sent.");
      return;
    }

    ws.value.send("Audio File Started");
  };

  const sendAudioSignalEndMessage = async () => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not open, chunk not sent.");
      return;
    }

    ws.value.send("Audio File Ended");
  };

  // ---- METHODS: Internal ----

  const decodeChunkImpedance = (message: any[]) => {
    const str = message.toString();
    const numbers = str.split(",").map(Number);
    const chunk = new Uint8Array(numbers);

    // Skip first byte (header) and last byte (stop byte)
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];
    data.value["sampleNumber"].push(sampleNumber);
    data.value["timestamp"].push(new Date().getTime());

    // Parse EEG data for all channels
    const eegData = [];

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.5364418669;
      const channelName = `A${Math.ceil((i - 1) / 3)}`;

      // @ts-ignore-next-line: Der meckert, weil der key count vom Typ string ist.
      data.value[channelName as keyof OpenBCICytonData].push(channelData);
      eegData.push(channelData);
    }
    const Acc0 = interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125;
    const Acc1 = interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125;
    const Acc2 = interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125;
    try {
      data.value["Accel0"].push(Acc0);
      data.value["Accel1"].push(Acc1);
      data.value["Accel2"].push(Acc2);
    } catch (e) {
      console.log(e);
    }
  };

  // Wie configureBoard in cyton.js
  const runImpedanceCheckForChannel = async (channel: number) => {
    const startCommands = [
      "x1000010Xz101Z", // Start impedance check for channel 1
      "x2000010Xz201Z", // Start impedance check for channel 2
      "x3000010Xz301Z", // Start impedance check for channel 3
      "x4000010Xz401Z", // Start impedance check for channel 4
      "x5000010Xz501Z", // Start impedance check for channel 5
      "x6000010Xz601Z", // Start impedance check for channel 6
      "x7000010Xz701Z", // Start impedance check for channel 7
      "x8000010Xz801Z", // Start impedance check for channel 8
    ];
    const resetCommands = [
      "x1060110Xz100Z", // Reset impedance check for channel 1
      "x2060110Xz200Z", // Reset impedance check for channel 2
      "x3060110Xz300Z", // Reset impedance check for channel 3
      "x4060110Xz400Z", // Reset impedance check for channel 4
      "x5060110Xz500Z", // Reset impedance check for channel 5
      "x6060110Xz600Z", // Reset impedance check for channel 6
      "x7060110Xz700Z", // Reset impedance check for channel 7
      "x8060110Xz800Z", // Reset impedance check for channel 8
    ];

    const channelCheckStartCommand = startCommands[channel - 1];
    const channelCheckResetCommand = resetCommands[channel - 1];

    if (!channelCheckStartCommand || !channelCheckResetCommand) {
      console.error("Invalid channel index:", channel);

      return;
    }

    try {
      // Check if the port is writable before writing data
      if (!port.value || !port.value.writable) {
        console.error("Serial port is not writable");

        return;
      }

      let writer = port.value.writable.getWriter();

      await writer.write(new TextEncoder().encode(channelCheckStartCommand)); // Start Impedance Command
      console.log("Impedance check command sent for channel " + channel);
      writer.releaseLock();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 5 seconds
      await commandBoardStartStreamingData(RecordingMode.IMPEDANCE); // Start recording for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
      console.log("Waiting for 5 sec"); // Deactivate impedance measurement after 5 seconds
      console.log("Impedance check completed for channel " + channel);
      await stopImpedanceRecordingForChannel("A" + channel);
      writer = port.value.writable.getWriter();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 5 seconds
      await writer.write(new TextEncoder().encode(channelCheckResetCommand)); // Reset Command
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 5 seconds
      console.log("Reset command sent for channel " + channel);
      writer.releaseLock();
    } catch (error) {
      console.error("Error sending commands:", error);
    }
  };

  const stopImpedanceRecordingForChannel = async (channel: string) => {
    try {
      isRecording.value = false;
      // Check if the port is writable before writing data
      if (!port.value || !port.value.writable) {
        console.error("Serial port is not writable");

        return;
      }

      const writer = port.value.writable.getWriter();
      await writer.write(
        new TextEncoder().encode(CytonBoardCommands.STOP_STREAMING),
      );
      console.log("Recording stopped");
      writer.releaseLock();
      console.log(
        "finished rec: " + data.value[channel as keyof OpenBCICytonData],
      );
      data.value.count = `${data.value[channel as keyof OpenBCICytonData].length}`;
      console.log("Channel: " + channel);
      console.log("Data: " + data.value[channel as keyof OpenBCICytonData]);
      // Prepare data to send
      // @ts-ignore-next-line
      const raw_data = data.value[channel as keyof OpenBCICytonData].map(
        // @ts-ignore-next-line
        (value) => parseFloat(value),
      ); // Convert values to floats if necessary

      console.log(data.value);
      // Send data to http://localhost:5001/calculate_impedance
      const response = await fetch("/data/calculate_impedance/" + 250, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data_raw: raw_data, channel: channel }),
      });
      console.log("Data sent to calculate impedance:", raw_data);
      const impedanceValue = await response.json(); // Get impedance value from the response
      impedanceDataRaw.value[channel] = impedanceValue.impedance; // Store impedance value in the global variable
      console.log(
        "Impedance value for channel " + channel + ":",
        impedanceValue.impedance,
      );
    } catch (error) {
      console.error("Error stopping recording:", error);
    }

    data.value = OPEN_BCI_CYTON_DATA_DEFAULT_VALUE;
  };

  const resetImpedance = (config: string) => {
    const impedanceArray = [];
    impedanceDataRaw.value = [];
    impedanceCheckChannel.value = 1;
    const assignment = channelAssignment[config];

    for (const channel in assignment) {
      const node_id = assignment[channel];
      const impedanceValue = 0;
      const state = 0;

      impedanceArray.push({
        node_id: node_id,
        state: state,
        impedance: impedanceValue,
      });
    }

    return impedanceArray;
  };

  const decodeCytonData = (message: any): OpenBCISerialData => {
    const str = message.toString();
    const numbers = str.split(",").map(Number);

    const chunk = new Uint8Array(numbers);
    const byteArray = chunk.slice(1, -1);
    const sampleNumber = chunk[1];

    const dataChunk: OpenBCISerialData = {
      ...DEFAULT_OPEN_BCI_SERIAL_DATA,
      sampleNumber: sampleNumber,
      timestamp: new Date().getTime(),
      Accel0: interpret16bitAsInt32(chunk.slice(26, 28)) * 0.000125,
      Accel1: interpret16bitAsInt32(chunk.slice(28, 30)) * 0.000125,
      Accel2: interpret16bitAsInt32(chunk.slice(30, 32)) * 0.000125,
    };

    for (let i = 2; i <= 24; i += 3) {
      const channelData =
        interpret24bitAsInt32(byteArray.slice(i - 1, i + 2)) * 0.0223517445;
      const channelId = `A${Math.ceil((i - 1) / 3)}`;

      dataChunk[channelId as keyof OpenBCISerialData] = channelData;
    }

    // console.log("Data Chunk");
    // console.log(dataChunk);

    return dataChunk;
  };

  /**
   * decodeChunk in cyton.js
   *
   * Send a complete chunk to the WebSocket Server.
   * @param chunk - The chunk of received EEG data to be sent to the server.
   */
  const sendChunkToWebSocket = async (chunk: any[]) => {
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
  const commandBoardStartStreamingData = async (mode: RecordingMode) => {
    recordingMode.value = mode;
    isRecording.value = true;
    impedanceRecordingStartTime.value = getReadableTimestamp();

    // Check if the port is writable before writing data
    if (!port.value || !port.value.writable) {
      console.error("Serial port is not writable");
      return;
    }

    startRecordingTime.value = getReadableTimestamp();
    try {
      const writer = port.value.writable.getWriter();

      await writer.write(
        getEncodedCytonCommand(CytonBoardCommands.START_STREAMING),
      );
      await writer.write(
        getEncodedCytonCommand(CytonBoardCommands.CONFIGURE_SAMPLING_RATE),
      );
      console.log("Recording started");
      isRecording.value = true;

      writer.releaseLock();
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
    await commandBoardStartStreamingData(RecordingMode.RECORDING);
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
    // console.log("readFromStream");
    // console.log(reader.value);
    try {
      if (!reader.value) {
        console.error("No reader found");
        return { value: null, done: false };
      }
      const { value, done } = await reader.value.read();
      // console.log(value);
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

  const exportImpedanceCSV = () => {
    const objectKeys = Object.keys(impedanceDataRaw.value);
    const csvContent = parseAndExportImpedance(
      impedanceDataRaw.value,
      objectKeys,
    );
    const startTime = Math.floor(
      new Date(impedanceRecordingStartTime.value).getTime() / 1000,
    );
    const fileName = `${participantId.value}-${startTime}-Impedance.csv`;

    const formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("csvContent", csvContent);

    fetch("/api/save-csv", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("CSV file saved successfully:", data.filePath);
      })
      .catch((error) => {
        console.error("Error saving CSV file:", error);
      });
  };

  // @ts-ignore-next-line
  const parseAndExportImpedance = (data, objectKeys) => {
    console.log("DATA AND OBJKEYS");
    console.log(data);
    console.log(objectKeys);
    const headers = `Index;Datetime;${objectKeys.join(";")}`;

    // Transpose data
    // @ts-ignore-next-line
    const transposedData = objectKeys.map((key) => {
      if (Array.isArray(data[key])) {
        return data[key];
      } else {
        // If it's a string, create an array with a single element
        return [data[key]];
      }
    });

    // Find the maximum length among the arrays
    // @ts-ignore-next-line
    const maxLength = Math.max(...transposedData.map((arr) => arr.length));

    // Fill shorter arrays with empty strings to match the maximum length
    // @ts-ignore-next-line
    const filledData = transposedData.map((arr) => {
      const diff = maxLength - arr.length;
      return arr.concat(Array(diff).fill(""));
    });

    // Add index and current timestamp
    const timestamp = new Date().toISOString();
    const firstRow = `1;${timestamp};${filledData
      // @ts-ignore-next-line
      .map((arr) => arr[0])
      .join(";")}`;
    const remainingRows = [];
    for (let i = 1; i < maxLength; i++) {
      // @ts-ignore-next-line
      const rowData = filledData.map((arr) => arr[i]);
      remainingRows.push(rowData.join(";"));
    }

    // Combine rows with newline characters
    const csvContent =
      headers + "\n" + firstRow + "\n" + remainingRows.join("\n");

    return csvContent;
  };

  // ---- RETURN ----

  return {
    setupSerialConnection,
    startSignalQualityCheck,
    startRecording,
    stopRecording,
    signalRMS,
    throttledBuffer,
    runImpedanceCheck,
    isImpedanceCheckRunning,
    impedanceCheckChannel,
    sendAudioSignalStartMessage,
    sendAudioSignalEndMessage,
  };
};
