/** * Vue component for starting and recording EEG data. * This component
includes functionality for connecting to the EEG device, * performing device
checks, and starting/stopping the recording. * */
<template>
  <div>
    <!-- Circular progress component -->
    <v-overlay v-model="loading">
      <div class="overlay_content">
        <v-card id="card_connect">
          <v-card-title>Hinweis</v-card-title>
          <v-card-text>
            {{ message }}
          </v-card-text>
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
        <h2>Bitte geben Sie Ihre Teilnehmernummer an.</h2>
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
            <v-card-title>Hilfe</v-card-title>
            <v-card-text>
              Gebem Sie Ihre zugeteilte Teilnehmernummer an und verbinden Sie
              Ihr Gerät. Verwenden Sie den entsprechenden Port des Headsets.
              Falls Sie einen Mac verwenden lautet dieser "FT231X USB UART"
              unter Windows "COM3".
            </v-card-text>
            <v-card-actions>
              <v-btn @click="partHelp">Schließen</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <h2 v-if="!showContinueButton && participantNumberSet">Geräteüberprüfung</h2>
    <h1 v-if="showContinueButton && participantNumberSet">Aufnahme</h1>

    <div v-show="!showContinueButton && participantNumberSet" class="headphones">
      <!-- Device Check Content -->

      <svg ref="baseModel" width="1000" height="500"></svg>
      <div class="tooltip"></div>
    </div>
    <div
      v-show="showContinueButton && participantNumberSet && !participantNrInUrl"
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
      v-show="!showContinueButton && participantNumberSet && participantNrInUrl"
      class="button-container"
    >
      <v-btn @click="deviceCheck">Start</v-btn>
      <v-icon
        color="info"
        class="help"
        icon="mdi-help-circle-outline"
        size="x-small"
        @click="connectHelp"
      ></v-icon>
    </div>

    <v-dialog
      v-show="!showContinueButton && participantNumberSet"
      v-model="isConnectHelpOpen"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Hilfe</v-card-title>
        <v-card-text>
          Falls einzelne Kanäle ein Fehlersymbol anzeigen, schalten Sie das
          Gerät bitte aus und wieder ein und achten Sie darauf, dass die
          Elektrotroden korrekt angebracht sind.
        </v-card-text>
        <v-card-actions>
          <v-btn @click="connectHelp">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div v-if="showContinueButton && participantNumberSet">
      <!-- Cyton Connector Content -->
      <div class="recordButtons">
        <v-btn
          @click="startRecording"
          style="margin-right: 20px; margin-top: 20px"
          >Aufnahme starten</v-btn
        >
        <v-btn
          @click="stopRecording"
          style="margin-right: 20px; margin-top: 20px"
          >Aufnahme stoppen</v-btn
        >
      </div>
    </div>
     <!-- Horizontal line -->
<div v-show="showContinueButton && participantNumberSet"> 
  <div v-if="recordingStarted">
  <v-label style="margin-top: 20px; margin-right: 20px">Aufnahme läuft</v-label>
  <v-icon :color="recordingStarted ? 'red' : ''" v-if="recordingStarted">mdi-record-circle</v-icon>
</div>
  <v-divider style="margin-top: 50px"></v-divider>
  <v-banner
      class="my-4"
      color="warning"
      icon="$warning"
      lines="three"
    >
      <v-banner-text>
        Sobald Sie das Experiment beendet haben, klicken Sie auf "Aufnahme stoppen". Anschließend führen Sie bitte erneut eine Geräteüberprüfung durch, um zu Messen, ob die Elektroden immer noch korrekt angebracht sind.
      </v-banner-text>
      </v-banner>
      <div class="headphones">
      <svg ref="baseModel2" width="1000" height="500"></svg>
      <div class="tooltip2"></div>
      
    </div>
    <div style="display:flex; justify-content:center;">
    <v-btn @click="deviceCheck">Geräteüberprüfung starten</v-btn>
  </div>
</div>
    <!-- <div v-show="!showContinueButton && participantNumberSet">
      <div class="chart-container">
        <canvas ref="Chart0"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart1"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart2"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart3"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart4"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart5"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart6"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart7"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart8"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart9"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart10"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart11"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart12"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart13"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart14"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart15"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart16"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart17"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart18"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart19"></canvas>
      </div>
      <div class="chart-container">
        <canvas ref="Chart20"></canvas>
      </div>
    </div> -->
  </div>
</template>

<script>
import { cyton } from "../scripts/cyton.js";
import Chart from "chart.js";
import * as d3 from "d3";
import channelAssignment from "../config/channelAssignment.json";

export default {
  data() {
    return {
      participantNr: this.participantNr || '',
      participantNumberSet: this.participantNumberSet || false,      
      status: "Not connected",
      port: "",
      data: {},
      reader: "",
      channelAssignment: channelAssignment,
      isParticipantHelpOpen: false,
      isConnectHelpOpen: false,
      cytonBoard: null,
      showContinueButton: true,
      loading: false, // Add loading state
      minWidth: 960,
      maxWidthPercent: 70,
      showIcon1: false,
      showIcon2: false,
      showIcon3: false,
      showIcon4: false,
      showIcon5: false,
      showIcon6: false,
      showIcon7: false,
      showIcon8: false,
      showIcon9: false,
      showIcon10: false,
      showIcon11: false,
      showIcon12: false,
      showIcon13: false,
      showIcon14: false,
      showIcon15: false,
      showIcon16: false,
      showIcon17: false,
      showIcon18: false,
      showIcon19: false,
      showIcon20: false,
      showIcon21: false,
      participantNrInUrl : this.participantNrInUrl || false,
      myChart: null,
      chartData0: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 0",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData1: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 1",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData2: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 2",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData3: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 3",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData4: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 4",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData5: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 5",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData6: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 6",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData7: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 7",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData8: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 8",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData9: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 9",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData10: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 10",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData11: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 11",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData12: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 12",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData13: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 13",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData14: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 14",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData15: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 15",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData16: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 16",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData17: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 17",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData18: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 18",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData19: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 19",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
      chartData20: {
        labels: ["time"],
        datasets: [
          {
            label: "Channel 20",
            backgroundColor: "rgba(0, 135, 108, 0.2)",
            borderColor: "rgba(0, 135, 108, 1)",
            borderWidth: 1,
            data: [], // Fake data for the chart
          },
        ],
      },
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
    };
  },
  beforeCreate() {
    const urlParams = new URLSearchParams(window.location.search);
    const participantNumberParam = urlParams.get("AbXHPCkszw");
    if (participantNumberParam) {
      const decodedParticipantNumber = atob(participantNumberParam);
      this.participantNumber = decodedParticipantNumber;
      this.participantNumberSet = true;
      this.participantNrInUrl = true;
    }
  },
  mounted() {
    this.renderChart0();
    this.renderChart1();
    this.renderChart2();
    this.renderChart3();
    this.renderChart4();
    this.renderChart5();
    this.renderChart6();
    this.renderChart7();
    this.renderChart8();
    this.renderChart9();
    this.renderChart10();
    this.renderChart11();
    this.renderChart12();
    this.renderChart13();
    this.renderChart14();
    this.renderChart15();
    this.renderChart16();
    this.renderChart17();
    this.renderChart18();
    this.renderChart19();
    this.renderChart20();
    this.cytonBoard = new cyton(
      this.onDecodedCallback,
      this.onConnectedCallback,
      this.onDisconnectedCallback,
      "",
      "CustomDecoder",
      115200
    );
    window.addEventListener("resize", this.handleResize);
    this.renderChart0();
    this.renderChart1();
    this.renderChart2();
    this.renderChart3();
    this.renderChart4();
    this.renderChart5();
    this.renderChart6();
    this.renderChart7();
    this.renderChart8();
    this.renderChart9();
    this.renderChart10();
    this.renderChart11();
    this.renderChart12();
    this.renderChart13();
    this.renderChart14();
    this.renderChart15();
    this.renderChart16();
    this.renderChart17();
    this.renderChart18();
    this.renderChart19();
    this.renderChart20();
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
      let impedance = this.cytonBoard.getImpedance();
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
                (d) => this.nodes.find((n) => n.id === d.node_id)?.x || 0
              )
              .attr(
                "cy",
                (d) => this.nodes.find((n) => n.id === d.node_id)?.y || 0
              )
              .attr("r", 12)
              .on("mouseover", this.handleMouseOver)
              .on("mouseout", this.handleMouseOut),
          (update) =>
            update.attr("class", (d) => `node ${this.stateToClass(d.state)}`)
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
                (d) => this.nodes.find((n) => n.id === d.node_id)?.x || 0
              )
              .attr(
                "cy",
                (d) => this.nodes.find((n) => n.id === d.node_id)?.y || 0
              )
              .attr("r", 12)
              .on("mouseover", this.handleMouseOver)
              .on("mouseout", this.handleMouseOut),
          (update) =>
            update.attr("class", (d) => `node ${this.stateToClass(d.state)}`)
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
            d.state
          )}<br/>Impedance: ${d.impedance}Ω`
        )
        .style("left", `${event.layerX + 5}px`)
        .style("top", `${event.layerY + 10}px`);
        this.tooltip2
        .style("opacity", 1)
        .html(
          `Node ID: ${d.node_id}<br/>State: ${this.stateToClass(
            d.state
          )}<br/>Impedance: ${d.impedance}Ω`
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
    async connectToCyton() {
      await this.cytonBoard
        .setupSerialAsync()
        .then(() => {
          this.status = "Connected to Cyton";
        })
        .catch((error) => {
          console.error("Connection failed", error);
          this.status = "Connection Failed";
        });

      await this.cytonBoard.startReading();
    },
    async impedanceCheck () {
      await this.startImpedanceCheck().then(
        () => {
          this.status = "Device check completed";
          let impedance = this.cytonBoard.getImpedance();
          this.nodeData = impedance;
          this.updateCircles();
          this.cytonBoard.exportImpedanceCSV(this.participantNumber);
          console.log("IMPORTANT: " + JSON.stringify(this.nodeData))
          console.log(channelAssignment)
          if(
            this.nodeData && this.nodeData.some(obj => obj.state !== 3)
          )
          {
            console.log("Impedance not sufficient")
            
          }
          else{
            this.showContinueButton = false;
          }
        
        },
        (error) => {
          this.loading = false;
          this.status = "Device check failed";
          console.error("Device check failed", error);
        }
      ); // Trigger impedance check for the current channel
    },
    async deviceCheck() {
      await this.cytonBoard.setupSerialAsync(); 
      this.participantNumberSet = true;
      await this.startImpedanceCheck().then(
        () => {
          this.status = "Device check completed";
          let impedance = this.cytonBoard.getImpedance();
          this.nodeData = impedance;
          this.updateCircles();
          this.showContinueButton = true;
          this.participantNumberSet = true;
          this.cytonBoard.exportImpedanceCSV(this.participantNumber);
          console.log("IMPORTANT: " + JSON.stringify(this.nodeData))
          console.log(channelAssignment)
          if(
            this.nodeData && this.nodeData.some(obj => obj.state !== 3)
          )
          {
            console.log("Impedance not sufficient")
            
          }
          else{
            this.showContinueButton = false;
          }
        
        },
        (error) => {
          this.loading = false;
          this.status = "Device check failed";
          console.error("Device check failed", error);
        }
      ); // Trigger impedance check for the current channel
    },
    async startImpedanceCheck() {
      for (let i = 1; i <= 8; i++) {
        this.loading = true;
        this.message = `Channel ${i} wird überprüft. Das kann einige Sekunden dauern. Bitte warten Sie und bewegen Sie den Kopf nicht.`;
        await this.cytonBoard.configureBoard(i).then(() => {
          let impedance = this.cytonBoard.getImpedance();
          this.nodeData = impedance;
          this.updateCircles();
          this.loading = false;
        }); // Trigger impedance check for the current channel
      }
    },
    decodedCallback(data) {
      this.data = data;
    },
    onDisconnectedCallback() {
      this.status = "Disconnected from Cyton";
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
      this.cytonBoard.startReading();
      this.recordingStarted = true;
    },
    async stopRecording() {
      this.cytonBoard.stopReading(this.participantNumber);
      this.recordingStarted = false;
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
    async renderChart0() {
      const canvas0 = this.$refs.Chart0;
      if (!canvas0) {
        // Exit if the canvas element is not found
        return;
      }

      const ctx0 = canvas0.getContext("2d");
      this.Chart0 = new Chart(ctx0, {
        type: "line",
        data: this.chartData0,
        options: {
          animation: {
            duration: 1000,
            easing: "linear",
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart1() {
      const canvas1 = this.$refs.Chart1;
      if (!canvas1) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx1 = canvas1.getContext("2d");
      this.Chart1 = new Chart(ctx1, {
        type: "line",
        data: this.chartData1,
        options: {
          animation: {
            duration: 1000,
            easing: "linear",
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart2() {
      const canvas2 = this.$refs.Chart2;
      if (!canvas2) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx2 = canvas2.getContext("2d");
      this.Chart2 = new Chart(ctx2, {
        type: "line",
        data: this.chartData2,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart3() {
      const canvas3 = this.$refs.Chart3;
      if (!canvas3) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx3 = canvas3.getContext("2d");
      this.Chart3 = new Chart(ctx3, {
        type: "line",
        data: this.chartData3,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart4() {
      const canvas4 = this.$refs.Chart4;
      if (!canvas4) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx4 = canvas4.getContext("2d");
      this.Chart4 = new Chart(ctx4, {
        type: "line",
        data: this.chartData4,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart5() {
      const canvas5 = this.$refs.Chart5;
      if (!canvas5) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx5 = canvas5.getContext("2d");
      this.Chart5 = new Chart(ctx5, {
        type: "line",
        data: this.chartData5,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart6() {
      const canvas6 = this.$refs.Chart6;
      if (!canvas6) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx6 = canvas6.getContext("2d");
      this.Chart6 = new Chart(ctx6, {
        type: "line",
        data: this.chartData6,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart7() {
      const canvas7 = this.$refs.Chart7;
      if (!canvas7) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx7 = canvas7.getContext("2d");
      this.Chart7 = new Chart(ctx7, {
        type: "line",
        data: this.chartData7,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart8() {
      const canvas8 = this.$refs.Chart8;
      if (!canvas8) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx8 = canvas8.getContext("2d");
      this.Chart8 = new Chart(ctx8, {
        type: "line",
        data: this.chartData8,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart9() {
      const canvas9 = this.$refs.Chart9;
      if (!canvas9) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx9 = canvas9.getContext("2d");
      this.Chart9 = new Chart(ctx9, {
        type: "line",
        data: this.chartData9,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart10() {
      const canvas10 = this.$refs.Chart10;
      if (!canvas10) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx10 = canvas10.getContext("2d");
      this.Chart10 = new Chart(ctx10, {
        type: "line",
        data: this.chartData10,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart11() {
      const canvas11 = this.$refs.Chart11;
      if (!canvas11) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx11 = canvas11.getContext("2d");
      this.Chart11 = new Chart(ctx11, {
        type: "line",
        data: this.chartData11,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart12() {
      const canvas12 = this.$refs.Chart12;
      if (!canvas12) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx12 = canvas12.getContext("2d");
      this.Chart12 = new Chart(ctx12, {
        type: "line",
        data: this.chartData12,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart13() {
      const canvas13 = this.$refs.Chart13;
      if (!canvas13) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx13 = canvas13.getContext("2d");
      this.Chart13 = new Chart(ctx13, {
        type: "line",
        data: this.chartData13,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart14() {
      const canvas14 = this.$refs.Chart14;
      if (!canvas14) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx14 = canvas14.getContext("2d");
      this.Chart14 = new Chart(ctx14, {
        type: "line",
        data: this.chartData14,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart15() {
      const canvas15 = this.$refs.Chart15;
      if (!canvas15) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx15 = canvas15.getContext("2d");
      this.Chart15 = new Chart(ctx15, {
        type: "line",
        data: this.chartData15,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart16() {
      const canvas16 = this.$refs.Chart16;
      if (!canvas16) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx16 = canvas16.getContext("2d");
      this.Chart16 = new Chart(ctx16, {
        type: "line",
        data: this.chartData16,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart17() {
      const canvas17 = this.$refs.Chart17;
      if (!canvas17) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx17 = canvas17.getContext("2d");
      this.Chart17 = new Chart(ctx17, {
        type: "line",
        data: this.chartData17,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart18() {
      const canvas18 = this.$refs.Chart18;
      if (!canvas18) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx18 = canvas18.getContext("2d");
      this.Chart18 = new Chart(ctx18, {
        type: "line",
        data: this.chartData18,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart19() {
      const canvas19 = this.$refs.Chart19;
      if (!canvas19) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx19 = canvas19.getContext("2d");
      this.Chart19 = new Chart(ctx19, {
        type: "line",
        data: this.chartData19,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },
    renderChart20() {
      const canvas20 = this.$refs.Chart20;
      if (!canvas20) {
        // Exit if the canvas element is not found
        return;
      }
      const ctx20 = canvas20.getContext("2d");
      this.Chart20 = new Chart(ctx20, {
        type: "line",
        data: this.chartData20,
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],
          },
          maintainAspectRatio: false,
          elements: {
            point: {
              radius: 0,
            },
          },
          legend: {
            position: "left",
          },
        },
      });
    },

    updateDataFromCyton() {
      this.data = this.cytonBoard.getData(); // Get the data from cyton.js and assign it to dataFromCyton

      for (let i = 0; i < 20; i++) {
        // Update chartData with new data
        const dataIndex = "A" + i;
        if (this.data[dataIndex]) {
          let cleanedData = this.data[dataIndex].filter((value) => value !== 0);
          cleanedData = cleanedData.slice(-500); // Take only the last 100 non-zero values
          this["chartData" + i].datasets[0].data = cleanedData;
          this["chartData" + i].labels = Array(cleanedData.length)
            .fill()
            .map((_, j) => j);

          // Get canvas reference
          const canvas = this.$refs["Chart" + i];

          if (!canvas) {
            // Exit if the canvas element is not found
            return;
          }

          // Update the chart
          this["Chart" + i].update();
        }
      }
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style>
/* Add your styles specific to this component if needed */
h2 {
  top: 10%;
  text-align: center;
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
