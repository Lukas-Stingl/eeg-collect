<script setup>
/**
 * Vue component for starting and recording EEG data.
 * This component includes functionality for connecting to the EEG device,
 * performing device checks, and starting/stopping the recording.
 */

import {
  ref,
  onMounted,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  getCurrentInstance,
  watch,
} from "vue";
import * as d3 from "d3";
import { PhWarningCircle } from "@phosphor-icons/vue";

import { CHECK_CONNECTED_DEVICE_STATUS, cyton } from "../scripts/cyton.js";
import CHANNEL_ASSIGNMENT from "../config/channelAssignment.json";
import { NODES_DEFAULT_VALUES, NODES } from "@/utils/types";
import {
  useConfigureParticipantId,
  useWebsocketConnection,
} from "@/utils/hooks";

// ---- STATE ----

const cytonBoard = ref(null); // Ref<cyton | null>
const snackbar = ref(false);
const participantNumber = ref("");
const participantNumberSet = ref(false);
const status = ref("Not connected");
const isHeadSetConnected = ref(false); // Ref<boolean | CHECK_CONNECTED_DEVICE_STATUS>
const errorModalTitle = ref("");
const errorModalMessage = ref("");
const isCytonConnectionLoadingIndicatorShown = ref(false);
const data = ref({});
const checkFinished = ref(false);
const channelConfig = ref("1");

useConfigureParticipantId();

// Modals
const isParticipantHelpOpen = ref(false);
const isHeadsetNotFoundErrorModalOpen = ref(false);
const isConnectHelpOpen = ref(false);

const showContinueButton = ref(true);
const loading = ref(false);
const participantNrInUrl = ref(false);
const badImpedance = ref(false);
const finished = ref(false);
const svg = ref(null);
const tooltip = ref(null);
const circles = ref(null);
const message = ref("Channel 1 wird überprüft.");
const recordingStarted = ref(false);
const progressValue = ref(0);
const bufferValue = ref(20);
const interval = ref(0);
const mode = ref("default");
const nodeData = ref(NODES_DEFAULT_VALUES);
const isButtonDisabled = ref(true);

const baseModel = ref(null);
// ---- MEMOIZE ----

const channelAssignment = computed(
  () => CHANNEL_ASSIGNMENT[channelConfig.value],
);

// ---- LIFECYCLE HOOKS ----

onBeforeMount(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const participantNumberParam = urlParams.get("AbXHPCkszw");
  channelConfig.value = urlParams.get("wlmtdoqtqe");
  channelAssignment.value = CHANNEL_ASSIGNMENT[channelConfig.value] || {};
  if (Object.keys(channelAssignment.value).length > 8) {
    mode.value = "daisy";
  } else {
    mode.value = "cyton";
  }
  if (participantNumberParam) {
    const decodedParticipantNumber = participantNumberParam;
    participantNumber.value = decodedParticipantNumber;
    participantNumberSet.value = true;
    participantNrInUrl.value = true;
  }
});

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);

  mode.value =
    Object.keys(channelAssignment.value).length > 8 ? "daisy" : "cyton";
  cytonBoard.value = new cyton(participantNumber.value, mode.value);
  window.addEventListener("resize", handleResize);
  updateDataFromCyton();
  // Set interval to call updateDataFromCyton method every 5 seconds (adjust as needed)
  setInterval(updateDataFromCyton, 500);

  if (!baseModel.value) {
    console.error("SVG reference not found.");
    return;
  }

  initializeD3();

  // Enable the button after 10 seconds (10000 milliseconds)
  setTimeout(() => {
    isButtonDisabled.value = false;
  }, 10000);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("beforeunload", handleBeforeUnload);
  clearInterval(interval.value);
});

const initializeD3 = () => {
  if (!baseModel.value) {
    console.error("SVG reference not found.");
    return;
  }
  console.log("Initializing D3");
  svg.value = d3
    .select(baseModel.value)
    .append("image")
    .attr("xlink:href", require("@/assets/baseModel.png"))
    .attr("width", 1000)
    .attr("height", 500);
  tooltip.value = d3.select(".tooltip");

  svg.value = d3.select(baseModel.value);
  circles.value = svg.value
    .selectAll("circle")
    .data(NODES)
    .enter()
    .append("circle")
    .attr("id", (d) => `node-${d.id}`)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => d.r)
    .attr("class", "node");
  // Update circles
  let impedance = cytonBoard.value.getImpedance(channelConfig.value);
  nodeData.value = impedance;
  updateCircles();
};

const handleBeforeUnload = (event) => {
  const confirmationMessage =
    "Are you sure you want to leave? Changes you made may not be saved.";
  event.returnValue = confirmationMessage; // Standard for most browsers
  return confirmationMessage; // For some browsers
};

const updateCircles = () => {
  svg.value = d3.select(baseModel.value);

  svg.value
    .selectAll("circle")
    .data(nodeData.value, (d) => d.node_id)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", (d) => `node ${stateToClass(d.state)}`)
          .attr("cx", (d) => NODES.find((n) => n.id === d.node_id)?.x || 0)
          .attr("cy", (d) => NODES.find((n) => n.id === d.node_id)?.y || 0)
          .attr("r", 12)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut),
      (update) => update.attr("class", (d) => `node ${stateToClass(d.state)}`),
    );
};

const stateToClass = (state) => {
  const stateClasses = ["off", "bad", "moderate", "good"];
  return stateClasses[state] || "unknown";
};

const handleMouseOut = (event) => {
  tooltip.value.style("opacity", 0);
  d3.select(event.target).attr("r", 12); // Reset radius

  // Remove desaturation from all circles
  svg.value.selectAll("circle").classed("desaturated", false);
};

const handleMouseOver = (event, d) => {
  tooltip.value
    .style("opacity", 1)
    .html(
      `Node ID: ${d.node_id}<br/>State: ${stateToClass(
        d.state,
      )}<br/>Impedance: ${d.impedance}Ω`,
    )
    .style("left", `${event.layerX + 5}px`)
    .style("top", `${event.layerY + 10}px`);

  // Select the current circle element using D3's event handling
  d3.select(event.target).attr("r", 14); // Enlarge on hover

  // Desaturate other circles
  svg.value
    .selectAll("circle")
    .filter((node) => node.node_id !== d.node_id)
    .classed("desaturated", true);
};

const toStartRecording = async () => {
  showContinueButton.value = false;
  badImpedance.value = false;
  await cytonBoard.value.defaultChannelSettings();
  startRecording();
  recordingStarted.value = true;
};

const handleRetryHeadsetConnection = () => {
  isHeadsetNotFoundErrorModalOpen.value = false;
  deviceCheck();
};

const deviceCheck = async () => {
  if (checkFinished.value === false) {
    isHeadSetConnected.value = await cytonBoard.value.setupSerialAsync(
      (status) => {
        isCytonConnectionLoadingIndicatorShown.value = status;
      },
    );
    console.log("B1 - connected:");
    console.log(isHeadSetConnected.value);
    if (isHeadSetConnected.value !== "success") {
      switch (isHeadSetConnected.value) {
        case CHECK_CONNECTED_DEVICE_STATUS.NO_DATA_STREAMED:
          errorModalTitle.value = "Wrong Port Selected";
          errorModalMessage.value =
            'No datastream detected. Please make sure to sleect the correct serial port in the browser pop up menu ("FT231X..." or "COM3").';
          break;
        case CHECK_CONNECTED_DEVICE_STATUS.DONGLE_CONNECTED_BUT_HEADSET_NOT_FOUND:
          errorModalTitle.value = "Headset not found";
          errorModalMessage.value =
            "Please make sure that the headset battery is charged and the headset is turned on.";
          break;
      }
      isHeadsetNotFoundErrorModalOpen.value = true;

      return;
    }

    console.log("B2 - connected:");
    console.log(isHeadSetConnected.value);
    await cytonBoard.value.defaultChannelSettings();
  }
  console.log("D");
  if (isHeadSetConnected.value === "success") {
    participantNumberSet.value = true;
    await startImpedanceCheck().then(
      () => {
        status.value = "Device check completed";
        let impedance = cytonBoard.value.getImpedance(channelConfig.value);
        nodeData.value = impedance;
        updateCircles();
        showContinueButton.value = true;
        participantNumberSet.value = true;
        cytonBoard.value.exportImpedanceCSV(participantNumber.value);
        console.log("IMPORTANT: " + JSON.stringify(nodeData.value));
        console.log(channelAssignment.value);
        if (
          nodeData.value.some((obj) => obj.state === 1) ||
          nodeData.value.filter((obj) => obj.state === 2).length >= 3
        ) {
          console.log("Impedance not sufficient");
          badImpedance.value = true;
          checkFinished.value = true;
        } else {
          showContinueButton.value = true;
          checkFinished.value = true;
        }
      },
      (error) => {
        loading.value = false;
        status.value = "Device check failed";
        console.error("Device check failed", error);
      },
    ); // Trigger impedance check for the current channel
  }
};

const startImpedanceCheck = async () => {
  await cytonBoard.value.defaultChannelSettings();
  let impedance = cytonBoard.value.resetImpedance(channelConfig.value);
  nodeData.value = impedance;
  updateCircles();
  console.log(
    "Channel Assignment: ",
    Object.keys(channelAssignment.value).length,
  );
  let channelNumber = Object.keys(channelAssignment.value).length;
  for (let i = 1; i <= channelNumber; i++) {
    loading.value = true;
    message.value = `Channel ${i} is being checked. This may take a few seconds. Please wait and do not move your head.`;
    startBuffer();
    await cytonBoard.value.configureBoard(i).then(() => {
      let impedance = cytonBoard.value.getImpedance(channelConfig.value);
      nodeData.value = impedance;
      updateCircles();
      loading.value = false;
    }); // Trigger impedance check for the current channel
  }
};

const startBuffer = () => {
  clearInterval(interval.value);

  // Reset progress values
  progressValue.value = 0;
  bufferValue.value = 0;

  // Calculate the total time and interval duration
  const totalTime = 6000; // 5 seconds in milliseconds
  const steps = 100; // Number of steps to complete progress
  const intervalDuration = totalTime / steps;

  // Start the interval to update progress
  interval.value = setInterval(() => {
    // Increment progress values
    progressValue.value += 100 / steps;
    bufferValue.value += 100 / steps;

    // Check if progress has reached 100%
    if (progressValue.value >= 100) {
      // Ensure the progress bar is exactly at 100%
      progressValue.value = 100;
      bufferValue.value = 100;
      // Stop the interval after the delay
      clearInterval(interval.value);
    }
  }, intervalDuration);
};

const handleResize = () => {
  const instance = getCurrentInstance();
  if (instance && instance.proxy) {
    instance.proxy.$forceUpdate();
  }
};

const startRecording = async () => {
  cytonBoard.value.startReading("record");
  recordingStarted.value = true;
};

const stopRecording = async () => {
  cytonBoard.value.stopReading(participantNumber.value);
  snackbar.value = true;
  recordingStarted.value = false;

  new Promise((resolve) => setTimeout(resolve, 6000)).then(async () => {
    console.log("Wait for snackbar...");

    await startImpedanceCheck().then(() => {
      status.value = "Device check completed";
      let impedance = cytonBoard.value.getImpedance(channelConfig.value);
      nodeData.value = impedance;
      cytonBoard.value.exportImpedanceCSV(participantNumber.value);
      finished.value = true;
    });
  });
};

const toggleHelpModal = () => {
  isParticipantHelpOpen.value = !isParticipantHelpOpen.value;
};

const toggleConnectHelpModal = () => {
  isConnectHelpOpen.value = !isConnectHelpOpen.value;
};

const redirectToStartRecording = () => {
  showContinueButton.value = false;
};

const setParticipantNumberAndContinue = async () => {
  participantNumber.value = document.getElementById("participantNr").value;

  await deviceCheck();
};

const updateDataFromCyton = () => {
  data.value = cytonBoard.value.getData(); // Get the data from cyton.js and assign it to dataFromCyton

  for (let i = 0; i < 20; i++) {
    // Update chartData with new data
    const dataIndex = "A" + i;
    if (data.value[dataIndex]) {
      let cleanedData = data.value[dataIndex].filter((value) => value !== 0);
      cleanedData = cleanedData.slice(-500); // Take only the last 100 non-zero values
    }
  }
};
</script>

<template>
  <div>
    <v-dialog
      v-model="isCytonConnectionLoadingIndicatorShown"
      max-width="500px"
      persistent
    >
      <v-card style="padding: 40px; border-radius: 12px; align-items: center">
        <v-progress-circular
          indeterminate
          :size="41"
          :width="5"
          color="#00594C"
          style="margin-bottom: 8px"
        ></v-progress-circular>

        <v-card-text style="padding-bottom: 0">
          Connecting Headset...
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Error Modal -->
    <v-dialog v-model="isHeadsetNotFoundErrorModalOpen" max-width="500px">
      <v-card style="padding: 16px; border-radius: 12px">
        <div style="display: flex; flex-direction: row; align-items: center">
          <PhWarningCircle :size="28" color="red" />

          <v-card-title style="text-align: left">
            {{ errorModalTitle }}
          </v-card-title>
        </div>

        <v-card-text style="text-align: left">
          {{ errorModalMessage }}
        </v-card-text>
        <v-card-actions style="justify-content: end">
          <v-btn
            @click="() => (isHeadsetNotFoundErrorModalOpen = false)"
            rounded="lg"
            >Close</v-btn
          >
          <VBtn
            @click="handleRetryHeadsetConnection"
            rounded="lg"
            variant="tonal"
            >Retry</VBtn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Circular progress component -->
    <v-overlay v-model="loading">
      <div class="overlay_content">
        <v-card id="card_connect">
          <!-- <v-card-title>Hinweis</v-card-title> -->
          <v-card-title>Note</v-card-title>
          <v-card-text>
            {{ message }}
          </v-card-text>
          <div style="margin: 10px">
            <v-progress-linear
              v-model="progressValue"
              :buffer-value="bufferValue"
            ></v-progress-linear>
          </div>
        </v-card>

        <v-progress-circular
          v-if="loading"
          color="#00876C"
          indeterminate
          size="64"
        ></v-progress-circular>
      </div>
    </v-overlay>

    <div v-if="!participantNumberSet">
      <!-- Participant Number Input Page -->
      <div class="header">
        <!-- <h2>Bitte geben Sie Ihre Teilnehmernummer an.</h2> -->*
        <h2>Please enter your participant number.</h2>
      </div>
      <div class="input">
        <v-text-field
          id="participantNr"
          class="input-field"
          label="Teilnehmernummer"
          ref="participantNumber"
        ></v-text-field>
      </div>

      <div class="input-container">
        <div class="button-container">
          <!-- Vue button for "Weiter zur Geräteüberprüfung" -->
          <v-btn
            class="vue-button weiter-button"
            @click="setParticipantNumberAndContinue"
            >Weiter</v-btn
          >
          <!-- Help button -->
          <v-icon
            class="help"
            color="info"
            icon="mdi-help-circle-outline"
            size="x-small"
            @click="toggleHelpModal"
          ></v-icon>
        </div>

        <v-dialog v-model="isParticipantHelpOpen" max-width="500px">
          <v-card>
            <v-card-title>Help</v-card-title>
            <v-card-text>
              Please connect your device. Use the appropriate port on your
              headset. If you are using a Mac, it is "FT231X USB UART", on
              Windows it is "COM3".
            </v-card-text>
            <v-card-actions>
              <v-btn @click="toggleHelpModal">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <h2 v-if="showContinueButton && participantNumberSet && !finished">
      Setup
    </h2>
    <h4 v-if="showContinueButton && participantNumberSet && !finished">
      Please initiate the measurement of resistances by clicking "Start Setup".
    </h4>
    <h2 v-if="!showContinueButton && participantNumberSet && !finished">
      Recording
    </h2>
    <h2 v-if="finished">The recording has ended.</h2>
    <h4 v-if="finished">You can now close the tab.</h4>
    <div v-if="badImpedance" max-width="500px">
      <v-card
        class="mx-auto"
        max-width="800"
        color="#E53935"
        elevation="4"
        padding="16px"
        variant="flat"
        rounded="lg"
      >
        <v-card-title>Headphone is not positioned correctly.</v-card-title>
        <v-card-text>
          The electrodes of the headset do not have a reliable skin connection.
          Please ensure that there are no hairs between the skin and the
          electrodes and firmly press the electrodes onto the skin. Please
          repeat the setup.
        </v-card-text>
      </v-card>
    </div>

    <div v-show="showContinueButton && participantNumberSet" class="headphones">
      <!-- Device Check Content -->

      <svg ref="baseModel" width="1000" height="500"></svg>
      <div class="tooltip"></div>
    </div>

    <div
      v-show="
        !showContinueButton && participantNumberSet && !participantNrInUrl
      "
      class="button-container"
    >
      <v-btn @click="redirectToStartRecording">Weiter</v-btn>
      <v-icon
        color="info"
        class="help"
        icon="mdi-help-circle-outline"
        size="x-small"
        @click="toggleConnectHelpModal"
      ></v-icon>
    </div>
    <div
      v-show="showContinueButton && participantNumberSet"
      style="
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        text-align: center;
      "
    >
      <span>Please ensure that&nbsp;</span>
      <b style="color: #73ad21">all electrodes are green</b>
      <span
        >&nbsp;before continuing or proceed to a recording after 3 impedance
        checks.</span
      >
    </div>

    <div
      v-show="showContinueButton && participantNumberSet && participantNrInUrl"
      class="button-container"
    >
      <v-btn @click="deviceCheck">Start Setup</v-btn>
      <div style="margin-right: 10px"></div>
      <v-btn v-if="checkFinished" @click="toStartRecording"
        >Go to Recording</v-btn
      >
      <v-icon
        color="#0277BD"
        class="help"
        icon="mdi-help-circle-outline"
        size="default"
        @click="toggleConnectHelpModal"
      ></v-icon>
    </div>

    <v-dialog
      v-show="showContinueButton && participantNumberSet"
      v-model="isConnectHelpOpen"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Help</v-card-title>
        <v-card-text>
          Please connect your device. Use the appropriate port on your headset.
          If you are using a Mac, it is "FT231X USB UART", on Windows it is
          "COM3".
        </v-card-text>
        <v-card-actions>
          <v-btn @click="toggleConnectHelpModal">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div v-if="!showContinueButton && participantNumberSet">
      <!-- Cyton Connector Content -->
      <div class="recordButtons">
        <!-- <v-btn
          @click="startRecording"
          style="margin-right: 20px; margin-top: 20px"
          >Aufnahme starten</v-btn
        > -->
        <!-- <v-btn
          @click="stopRecording"
          style="margin-right: 20px; margin-top: 20px"
          >Aufnahme stoppen</v-btn
        > -->
      </div>
    </div>
    <!-- Horizontal line -->
    <div v-show="!showContinueButton && participantNumberSet">
      <v-snackbar v-model="snackbar" :timeout="6000">
        The recording has been successfully saved. Please keep the headset on,
        resistance measurements will be checked again.

        <template v-slot:actions> </template>
      </v-snackbar>

      <h4 v-if="!finished">
        At the end of the experiment, you can stop the recording. Please return
        to the experiment tab now. Please do not close this tab.
      </h4>
      <div
        v-if="recordingStarted && !finished"
        style="
          justify-content: center;
          display: flex;
          align-items: flex-start;
          margin-bottom: 50px;
        "
      >
        <v-label style="margin-top: 20px; margin-right: 20px; font-size: 20px"
          >Recording in progress</v-label
        >
        <img
          v-if="recordingStarted"
          :src="require('@/assets/dot.gif')"
          :alt="'Recording'"
          style="height: 70px; justify-content: flex-end; display: flex"
        />
      </div>

      <div v-if="!finished" style="display: flex; justify-content: center">
        <v-btn :disabled="isButtonDisabled" @click="stopRecording"
          >Stop recording</v-btn
        >
      </div>
    </div>
  </div>
</template>

<style>
/* Add your styles specific to this component if needed */
h2 {
  top: 10%;
  text-align: center;
  margin-bottom: 25px;
}
h4 {
  top: 10%;
  text-align: center;
  margin-bottom: 25px;
}

.headphones {
  position: relative;
  display: flex;
  justify-content: center;
}
.help {
  z-index: 9999999;
  position: relative;
}

.button-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 35px;
  left: 50%;
  transform: translate(-50%, -50%);
}
.input {
  margin-top: 50px;
  max-width: 300px;

  margin-left: auto;
  margin-right: auto;
}
.deviceCheck {
  margin-top: 25px;
  height: 100%;
}
.v-overlay {
  background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent overlay */
  display: flex;
  align-items: top;
  justify-content: center;
  z-index: 9999; /* Ensure it's above other content */
}

/* Optionally, you can add styles to center the content in the card */
.v-card {
  text-align: center;
}
/* Centering the notification dialog */
.overlay_content {
  justify-content: center;
  display: flex;
  align-content: flex-end;
  flex-direction: column;
  align-items: center;
}
div#card_connect {
  margin-top: 50px;
  margin-bottom: 105px;
}
.chart-container {
  width: 50%; /* Ensure each chart takes up full width of its container */
  height: 90px; /* Adjust height of charts as needed */
}
.charts {
  display: grid;
  grid-template-columns: repeat(3, 4fr);
  gap: 10px;
}
.recordButtons {
  margin-bottom: 15px;
}
.node {
  fill-opacity: 0.8;
  stroke: white;
  stroke-width: 2;
}
.off {
  fill: gray;
}
.bad {
  fill: red;
}
.moderate {
  fill: orange;
}
.good {
  fill: green;
}

.tooltip {
  position: absolute;
  text-align: center;
  width: auto;
  padding: 4px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none; /* Don't block mouse events */
  opacity: 0; /* Hidden by default */
}

.desaturated {
  opacity: 0.2;
}
/* Continue this pattern for the rest of the icons */
</style>
