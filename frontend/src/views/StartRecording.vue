<!--
 * Vue component for starting and recording EEG data.
 * This component includes functionality for connecting to the EEG device,
 * performing device checks, and starting/stopping the recording.
-->

<template>
  <div>
    <!-- Error Modal -->
    <v-dialog v-model="isHeadsetNotFoundErrorModalOpen" max-width="500px">
      <v-card style="padding: 16px; border-radius: 12px">
        <div style="display: flex; flex-direction: row; align-items: center">
          <PhWarningCircle :size="28" color="red" />

          <v-card-title style="text-align: left">
            Headset not found
          </v-card-title>
        </div>

        <v-card-text style="text-align: left">
          Please make sure that your headset is turned on and that the correct
          port in the browser pop up menu is chosen ("FT231X..." or "COM3").
        </v-card-text>
        <v-card-actions style="justify-content: end">
          <v-btn
            @click="isHeadsetNotFoundErrorModalOpen = false"
            rounded="lg"
            variant="outline"
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
              v-model="value"
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
            @click="partHelp"
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
              <v-btn @click="partHelp">Close</v-btn>
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
      <v-card class="mx-auto" elevation="16" max-width="800" color="red">
        <v-card-title
          >WARNING: Headphone is not positioned correctly.</v-card-title
        >
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
        @click="connectHelp"
      ></v-icon>
    </div>
    <div
      v-show="showContinueButton && participantNumberSet"
      style="display: flex; justify-content: center"
    >
      Please ensure that &nbsp;<b style="color: #73ad21">
        all electrodes are green
      </b>
      &nbsp;before continuing or proceed to a recording after 3 impedance
      checks.
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
        color="info"
        class="help"
        icon="mdi-help-circle-outline"
        size="x-small"
        @click="connectHelp"
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
          <v-btn @click="connectHelp">Schließen</v-btn>
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
      <v-snackbar v-model="snackbar" :timeout="timeout">
        {{ text }}

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

<script>
import { ref, onMounted } from "vue";
import { CHECK_CONNECTED_DEVICE_STATUS, cyton } from "../scripts/cyton.js";
import * as d3 from "d3";
import channelAssignment from "../config/channelAssignment.json";
import { PhWarningCircle } from "@phosphor-icons/vue";

export default {
  components: { PhWarningCircle },
  data() {
    return {
      snackbar: false,
      text: "The recording has been successfully saved. Please keep the headset on, resistance measurements will be checked again.",
      timeout: 6000,
      participantNr: this.participantNr || "",
      participantNumberSet: this.participantNumberSet || false,
      status: "Not connected",
      port: "",
      isHeadSetConnected: false || CHECK_CONNECTED_DEVICE_STATUS,
      data: {},
      reader: "",
      checkFinished: false,
      channelConfig: this.channelConfig || "1",
      channelAssignment: channelAssignment[this.channelConfig],
      isParticipantHelpOpen: false,
      isHeadsetNotFoundErrorModalOpen: false,
      isConnectHelpOpen: false,
      cytonBoard: null,
      showContinueButton: true,
      loading: false, // Add loading state
      minWidth: 960,
      maxWidthPercent: 70,
      participantNrInUrl: this.participantNrInUrl || false,
      myChart: null,
      badImpedance: false,
      finished: false,
      nodes: [
        { id: "C3", x: 663 * (2 / 3), y: 188 * (5 / 8), r: 10 },
        { id: "Cz", x: 729 * (2 / 3), y: 170 * (5 / 8), r: 10 },
        { id: "C4", x: 796 * (2 / 3), y: 188 * (5 / 8), r: 10 },
        { id: "L3", x: 593 * (2 / 3), y: 412 * (5 / 8), r: 10 },
        { id: "L2", x: 635 * (2 / 3), y: 404 * (5 / 8), r: 10 },
        { id: "L4", x: 600 * (2 / 3), y: 467 * (5 / 8), r: 10 },
        { id: "L1", x: 654 * (2 / 3), y: 446 * (5 / 8), r: 10 },
        { id: "L5", x: 622 * (2 / 3), y: 540 * (5 / 8), r: 10 },
        { id: "L8", x: 679 * (2 / 3), y: 516 * (5 / 8), r: 10 },
        { id: "L6", x: 648 * (2 / 3), y: 592 * (5 / 8), r: 10 },
        { id: "L7", x: 683 * (2 / 3), y: 580 * (5 / 8), r: 10 },
        { id: "R2", x: 831 * (2 / 3), y: 401 * (5 / 8), r: 10 },
        { id: "R3", x: 865 * (2 / 3), y: 418 * (5 / 8), r: 10 },
        { id: "R1", x: 799 * (2 / 3), y: 447 * (5 / 8), r: 10 },
        { id: "R4", x: 853 * (2 / 3), y: 467 * (5 / 8), r: 10 },
        { id: "R8", x: 776 * (2 / 3), y: 511 * (5 / 8), r: 10 },
        { id: "R5", x: 826 * (2 / 3), y: 535 * (5 / 8), r: 10 },
        { id: "R7", x: 762 * (2 / 3), y: 563 * (5 / 8), r: 10 },
        { id: "R6", x: 804 * (2 / 3), y: 582 * (5 / 8), r: 10 },
      ],
      nodeData: [
        { node_id: "C3", state: 0, impedance: 0 },
        { node_id: "Cz", state: 0, impedance: 0 },
        { node_id: "C4", state: 0, impedance: 0 },
        { node_id: "L3", state: 0, impedance: 0 },
        { node_id: "L2", state: 0, impedance: 0 },
        { node_id: "L4", state: 0, impedance: 0 },
        { node_id: "L1", state: 0, impedance: 0 },
        { node_id: "L5", state: 0, impedance: 0 },
        { node_id: "L8", state: 0, impedance: 0 },
        { node_id: "L6", state: 0, impedance: 0 },
        { node_id: "L7", state: 0, impedance: 0 },
        { node_id: "R2", state: 0, impedance: 0 },
        { node_id: "R3", state: 0, impedance: 0 },
        { node_id: "R1", state: 0, impedance: 0 },
        { node_id: "R4", state: 0, impedance: 0 },
        { node_id: "R8", state: 0, impedance: 0 },
        { node_id: "R5", state: 0, impedance: 0 },
        { node_id: "R7", state: 0, impedance: 0 },
        { node_id: "R6", state: 0, impedance: 0 },
      ],
      svg: null,
      svg2: null,
      tooltip: null,
      tooltip2: null,
      circles: null,
      circles2: null,
      impedance: {},
      writer: "",
      message: "Channel 1 wird überprüft.",
      recordingStarted: false,
      value: 0,
      bufferValue: 20,
      interval: 0,
      mode: "default",
    };
  },
  setup() {
    const isButtonDisabled = ref(true);

    onMounted(() => {
      // Enable the button after 1 minute (60000 milliseconds)
      setTimeout(() => {
        isButtonDisabled.value = false;
      }, 10000);
    });

    return {
      isButtonDisabled,
    };
  },
  beforeCreate() {
    const urlParams = new URLSearchParams(window.location.search);
    const participantNumberParam = urlParams.get("AbXHPCkszw");
    this.channelConfig = urlParams.get("wlmtdoqtqe");
    this.channelAssignment = channelAssignment[this.channelConfig] || {};
    if (Object.keys(this.channelAssignment).length > 8) {
      this.mode = "daisy";
    } else {
      this.mode = "cyton";
    }
    if (participantNumberParam) {
      const decodedParticipantNumber = participantNumberParam;
      this.participantNumber = decodedParticipantNumber;
      this.participantNumberSet = true;
      this.participantNrInUrl = true;
    }
  },

  mounted() {
    window.addEventListener("beforeunload", this.handleBeforeUnload);
    if (Object.keys(this.channelAssignment).length > 8) {
      this.mode = "daisy";
    } else {
      this.mode = "cyton";
    }
    this.cytonBoard = new cyton(this.participantNumber, this.mode);
    window.addEventListener("resize", this.handleResize);
    this.updateDataFromCyton();
    // Set interval to call updateDataFromCyton method every 5 seconds (adjust as needed)
    setInterval(this.updateDataFromCyton, 500);
    this.initializeD3();
  },
  computed: {
    colWidth() {
      return window.innerWidth >= this.minWidth ? "50%" : "100%";
    },
  },
  methods: {
    handleBeforeUnload(event) {
      const confirmationMessage =
        "Are you sure you want to leave? Changes you made may not be saved.";
      event.returnValue = confirmationMessage; // Standard for most browsers
      return confirmationMessage; // For some browsers
    },
    /**
     * Maps the 'setParticipantNumber' mutation to the component's methods.
     * This allows the component to easily call the 'setParticipantNumber' mutation
     * and update the participant number in the Vuex store.
     */

    initializeD3() {
      if (!this.$refs.baseModel) {
        console.error("SVG reference not found.");
        return;
      }
      console.log("Initializing D3");
      this.svg = d3
        .select(this.$refs.baseModel)
        .append("image")
        .attr("xlink:href", require("@/assets/baseModel.png"))
        .attr("width", 1000)
        .attr("height", 500);
      this.svg2 = d3
        .select(this.$refs.baseModel2)
        .append("image")
        .attr("xlink:href", require("@/assets/baseModel.png"))
        .attr("width", 1000)
        .attr("height", 500);
      this.tooltip = d3.select(".tooltip");
      this.tooltip2 = d3.select(".tooltip2");

      this.svg = d3.select(this.$refs.baseModel);
      this.svg2 = d3.select(this.$refs.baseModel2);
      this.circles = this.svg
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr("id", (d) => `node-${d.id}`)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => d.r)
        .attr("class", "node");
      this.circles2 = this.svg2
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr("id", (d) => `node-${d.id}`)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => d.r)
        .attr("class", "node");
      // Update circles
      let impedance = this.cytonBoard.getImpedance(this.channelConfig);
      this.nodeData = impedance;
      this.updateCircles();
    },

    updateCircles() {
      this.svg = d3.select(this.$refs.baseModel);
      this.svg2 = d3.select(this.$refs.baseModel2);

      this.svg
        .selectAll("circle")
        .data(this.nodeData, (d) => d.node_id)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", (d) => `node ${this.stateToClass(d.state)}`)
              .attr(
                "cx",
                (d) => this.nodes.find((n) => n.id === d.node_id)?.x || 0,
              )
              .attr(
                "cy",
                (d) => this.nodes.find((n) => n.id === d.node_id)?.y || 0,
              )
              .attr("r", 12)
              .on("mouseover", this.handleMouseOver)
              .on("mouseout", this.handleMouseOut),
          (update) =>
            update.attr("class", (d) => `node ${this.stateToClass(d.state)}`),
        );
      this.svg2
        .selectAll("circle")
        .data(this.nodeData, (d) => d.node_id)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", (d) => `node ${this.stateToClass(d.state)}`)
              .attr(
                "cx",
                (d) => this.nodes.find((n) => n.id === d.node_id)?.x || 0,
              )
              .attr(
                "cy",
                (d) => this.nodes.find((n) => n.id === d.node_id)?.y || 0,
              )
              .attr("r", 12)
              .on("mouseover", this.handleMouseOver)
              .on("mouseout", this.handleMouseOut),
          (update) =>
            update.attr("class", (d) => `node ${this.stateToClass(d.state)}`),
        );
    },
    stateToClass(state) {
      const stateClasses = ["off", "bad", "moderate", "good"];
      return stateClasses[state] || "unknown";
    },
    handleMouseOver(event, d) {
      this.tooltip
        .style("opacity", 1)
        .html(
          `Node ID: ${d.node_id}<br/>State: ${this.stateToClass(
            d.state,
          )}<br/>Impedance: ${d.impedance}Ω`,
        )
        .style("left", `${event.layerX + 5}px`)
        .style("top", `${event.layerY + 10}px`);
      this.tooltip2
        .style("opacity", 1)
        .html(
          `Node ID: ${d.node_id}<br/>State: ${this.stateToClass(
            d.state,
          )}<br/>Impedance: ${d.impedance}Ω`,
        )
        .style("left", `${event.layerX + 5}px`)
        .style("top", `${event.layerY + 10}px`);

      // Select the current circle element using D3's event handling
      d3.select(event.target).attr("r", 14); // Enlarge on hover

      // Desaturate other circles
      this.svg
        .selectAll("circle")
        .filter((node) => node.node_id !== d.node_id)
        .classed("desaturated", true);
      this.svg2
        .selectAll("circle")
        .filter((node) => node.node_id !== d.node_id)
        .classed("desaturated", true);
    },
    handleMouseOut(event) {
      this.tooltip.style("opacity", 0);
      this.tooltip2.style("opacity", 0);
      d3.select(event.target).attr("r", 12); // Reset radius

      // Remove desaturation from all circles
      this.svg.selectAll("circle").classed("desaturated", false);
      this.svg2.selectAll("circle").classed("desaturated", false);
    },
    // async connectToCyton() {
    //   await this.cytonBoard
    //     .setupSerialAsync()
    //     .then(() => {
    //       this.status = "Connected to Cyton";
    //     })
    //     .catch((error) => {
    //       console.error("Connection failed", error);
    //       this.status = "Connection Failed";
    //     });

    //   await this.cytonBoard.startReading();
    // },
    async impedanceCheck() {
      await this.cytonBoard.defaultChannelSettings();
      await this.startImpedanceCheck().then(
        () => {
          this.status = "Device check completed";
          let impedance = this.cytonBoard.getImpedance(this.channelConfig);
          this.nodeData = impedance;
          this.updateCircles();
          this.cytonBoard.exportImpedanceCSV(this.participantNumber);
          console.log("IMPORTANT: " + JSON.stringify(this.nodeData));
          console.log(channelAssignment);
          if (this.nodeData && this.nodeData.some((obj) => obj.state !== 3)) {
            console.log("Impedance not sufficient");
            this.showContinueButton = false;
          } else {
            this.showContinueButton = false;
          }
        },
        (error) => {
          this.loading = false;
          this.status = "Device check failed";
          console.error("Device check failed", error);
        },
      ); // Trigger impedance check for the current channel
    },
    async toStartRecording() {
      this.showContinueButton = false;
      this.badImpedance = false;
      await this.cytonBoard.defaultChannelSettings();
      this.startRecording();
      this.recordingStarted = true;
    },

    handleRetryHeadsetConnection() {
      this.isHeadsetNotFoundErrorModalOpen = false;
      this.deviceCheck();
    },

    async deviceCheck() {
      if (this.checkFinished === false) {
        this.isHeadSetConnected = await this.cytonBoard.setupSerialAsync();
        console.log("B1 - connected:");
        console.log(this.isHeadSetConnected);
        if (this.isHeadSetConnected !== "success") {
          // TODO SPECIFIC ERROR MESSAGES FOR DIFFERENT CASES
          this.isHeadsetNotFoundErrorModalOpen = true;

          return;
        }

        console.log("B2 - connected:");
        console.log(this.isHeadSetConnected);
        await this.cytonBoard.defaultChannelSettings();
      }
      console.log("D");
      if (this.isHeadSetConnected === "success") {
        this.participantNumberSet = true;
        await this.startImpedanceCheck().then(
          () => {
            this.status = "Device check completed";
            let impedance = this.cytonBoard.getImpedance(this.channelConfig);
            this.nodeData = impedance;
            this.updateCircles();
            this.showContinueButton = true;
            this.participantNumberSet = true;
            this.cytonBoard.exportImpedanceCSV(this.participantNumber);
            console.log("IMPORTANT: " + JSON.stringify(this.nodeData));
            console.log(channelAssignment);
            if (
              this.nodeData.some((obj) => obj.state === 1) ||
              this.nodeData.filter((obj) => obj.state === 2).length >= 3
            ) {
              console.log("Impedance not sufficient");
              this.badImpedance = true;
              this.checkFinished = true;
            } else {
              this.showContinueButton = true;
              this.checkFinished = true;
            }
          },
          (error) => {
            this.loading = false;
            this.status = "Device check failed";
            console.error("Device check failed", error);
          },
        ); // Trigger impedance check for the current channel
      }
    },
    async startImpedanceCheck() {
      await this.cytonBoard.defaultChannelSettings();
      let impedance = this.cytonBoard.resetImpedance(this.channelConfig);
      this.nodeData = impedance;
      this.updateCircles();
      console.log(
        "Channel Assignment: ",
        Object.keys(this.channelAssignment).length,
      );
      let channelNumber = Object.keys(this.channelAssignment).length;
      for (let i = 1; i <= channelNumber; i++) {
        this.loading = true;
        this.message = `Channel ${i} is being checked. This may take a few seconds. Please wait and do not move your head.`;
        this.startBuffer();
        await this.cytonBoard.configureBoard(i).then(() => {
          let impedance = this.cytonBoard.getImpedance(this.channelConfig);
          this.nodeData = impedance;
          this.updateCircles();
          this.loading = false;
        }); // Trigger impedance check for the current channel
      }
    },
    async restartImpedance() {
      let impedance = this.cytonBoard.resetImpedance();
      this.nodeData = impedance;
      this.updateCircles();
      this.badImpedance = false;
      this.nodeData;
      this.participantNumberSet = true;
      await this.cytonBoard.defaultChannelSettings();
      await this.startImpedanceCheck().then(
        () => {
          this.status = "Device check completed";
          let impedance = this.cytonBoard.getImpedance(this.channelConfig);
          this.nodeData = impedance;
          this.updateCircles();
          this.showContinueButton = true;
          this.participantNumberSet = true;
          this.cytonBoard.exportImpedanceCSV(this.participantNumber);
          console.log("IMPORTANT: " + JSON.stringify(this.nodeData));
          console.log(channelAssignment);
          if (
            this.nodeData.some((obj) => obj.state === 1) ||
            this.nodeData.filter((obj) => obj.state === 2).length >= 3
          ) {
            console.log("Impedance not sufficient");
            this.badImpedance = true;
            this.checkFinished = true;
          } else {
            this.showContinueButton = false;
            this.checkFinished;
          }
        },
        (error) => {
          this.loading = false;
          this.status = "Device check failed";
          console.error("Device check failed", error);
        },
      );
    },
    decodedCallback(data) {
      this.data = data;
    },
    onDisconnectedCallback() {
      this.status = "Disconnected from Cyton";
    },
    startBuffer() {
      clearInterval(this.interval);

      // Reset progress values
      this.value = 0;
      this.bufferValue = 0;

      // Calculate the total time and interval duration
      const totalTime = 6000; // 5 seconds in milliseconds
      const steps = 100; // Number of steps to complete progress
      const intervalDuration = totalTime / steps;

      // Start the interval to update progress
      this.interval = setInterval(() => {
        // Increment progress values
        this.value += 100 / steps;
        this.bufferValue += 100 / steps;

        // Check if progress has reached 100%
        if (this.value >= 100) {
          // Ensure the progress bar is exactly at 100%
          this.value = 100;
          this.bufferValue = 100;
          // Stop the interval after the delay
          clearInterval(this.interval);
        }
      }, intervalDuration);
    },
    onConnectedCallback() {
      // this.cytonBoard.startReading();
      this.participantNumberSet = true;
      this.status = "Connected to Cyton";
    },
    handleResize() {
      this.$forceUpdate();
    },
    async startRecording() {
      this.cytonBoard.startReading("record");
      this.recordingStarted = true;
    },
    async stopRecording() {
      this.cytonBoard.stopReading(this.participantNumber);
      this.snackbar = true;
      this.recordingStarted = false;

      new Promise((resolve) => setTimeout(resolve, 6000)).then(async () => {
        console.log("Wait for snackbar...");

        await this.startImpedanceCheck().then(() => {
          this.status = "Device check completed";
          let impedance = this.cytonBoard.getImpedance(this.channelConfig);
          this.nodeData = impedance;
          this.cytonBoard.exportImpedanceCSV(this.participantNumber);
          this.finished = true;
        });
      });
    },
    partHelp() {
      this.isParticipantHelpOpen = !this.isParticipantHelpOpen;
    },
    connectHelp() {
      this.isConnectHelpOpen = !this.isConnectHelpOpen;
    },
    calculateAverage(data) {
      const sum = data.reduce((acc, val) => acc + val, 0);
      const average = sum / data.length;
      return average;
    },

    redirectToStartRecording() {
      this.showContinueButton = false;
    },
    async setParticipantNumberAndContinue() {
      this.participantNumber = document.getElementById("participantNr").value;

      await this.deviceCheck();
    },

    updateDataFromCyton() {
      this.data = this.cytonBoard.getData(); // Get the data from cyton.js and assign it to dataFromCyton

      for (let i = 0; i < 20; i++) {
        // Update chartData with new data
        const dataIndex = "A" + i;
        if (this.data[dataIndex]) {
          let cleanedData = this.data[dataIndex].filter((value) => value !== 0);
          cleanedData = cleanedData.slice(-500); // Take only the last 100 non-zero values
        }
      }
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    clearInterval(this.interval);
  },
};
</script>

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

.image-container {
  position: relative;
}
.headphones {
  position: relative;
  display: flex;
  justify-content: center;
}
.help {
  z-index: 9999999;
  left: 25px;
  top: 10px;
  position: relative;
}
.continue {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.help-class {
  display: flex;
  justify-content: flex-end;
}
.button-container {
  position: relative;
  display: flex;
  justify-content: center;
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
.tooltip2 {
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
