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
            {{
              "Das EEG Gerät wird gerade auf Funktionalität überprüft. Das kann bis zu 10 Sekunden dauern. Bitte warten Sie kurz."
            }}
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
        <h2> TEST Bitte geben Sie Ihre Teilnehmernummer an.</h2>
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

    <h2 v-if="showContinueButton && participantNumberSet">Device Check</h2>
    <h1 v-if="!showContinueButton && participantNumberSet">Aufnahme</h1>

    <v-container
      v-if="showContinueButton && participantNumberSet"
      class="content"
    >
      <!-- Device Check Content -->
      <v-row justify="center">
        <v-col
          cols="12"
          class="image-container"
          :style="{ flexBasis: colWidth, maxWidth: colWidth }"
        >
          <v-img
            :src="require('@/assets/headphones.png')"
            class="my-3"
            contain
          />
          <v-icon v-if="showIcon2" class="v-icon-2" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon3" class="v-icon-3" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon4" class="v-icon-4" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon5" class="v-icon-5" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon6" class="v-icon-6" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon7" class="v-icon-7" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon8" class="v-icon-8" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon9" class="v-icon-9" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon10" class="v-icon-10" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon11" class="v-icon-11" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon12" class="v-icon-12" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon13" class="v-icon-13" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon14" class="v-icon-14" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon15" class="v-icon-15" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon16" class="v-icon-16" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon17" class="v-icon-17" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon18" class="v-icon-18" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon19" class="v-icon-19" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon20" class="v-icon-20" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
          <v-icon v-if="showIcon21" class="v-icon-21" color="red" size="15"
            >mdi-alert-outline</v-icon
          >
        </v-col>
      </v-row>

      <div class="button-container">
        <v-btn @click="redirectToStartRecording">Weiter</v-btn>
        <v-icon
          color="info"
          class="help"
          icon="mdi-help-circle-outline"
          size="x-small"
          @click="connectHelp"
        ></v-icon>
      </div>

      <v-dialog v-model="isConnectHelpOpen" max-width="500px">
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
    </v-container>

    <div v-if="!showContinueButton && participantNumberSet">
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
    <div v-show="!showContinueButton && participantNumberSet">
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
    </div>
  </div>
</template>

<script>
import { cyton } from "../scripts/cyton.js";
import Chart from "chart.js";

export default {
  data() {
    return {
      participantNumber: "",
      status: "Not connected",
      data: {},
      isParticipantHelpOpen: false,
      isConnectHelpOpen: false,
      cytonBoard: null,
      participantNumberSet: false,
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
    };
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
    },
    isVarianceHigh(value) {
      return value > -187400 && value < -187600;
    },
    async deviceCheck() {
      // Show loading spinner
      await this.cytonBoard
        .checkDevice()
        .then(() => {
          this.loading = true;
        })
        .catch((error) => {
          console.error("Connection failed", error);
          this.status = "Connection Failed";
        });
      await this.cytonBoard.startReading();

      // Wait for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Call stopReading
      await this.cytonBoard
        .stopCheck()
        .then((res) => {
          console.log(res);
          this.data = res;
          this.loading = false;
          this.participantNumberSet = true;
          this.showIcon1 =
            this.calculateAverage(this.data["A0"].slice(0, 15)) === 0;
          this.showIcon2 =
            this.calculateAverage(this.data["A1"].slice(0, 15)) === 0;
          this.showIcon3 =
            this.calculateAverage(this.data["A2"].slice(0, 15)) === 0;
          this.showIcon4 =
            this.calculateAverage(this.data["A3"].slice(0, 15)) === 0;
          this.showIcon5 =
            this.calculateAverage(this.data["A4"].slice(0, 15)) === 0;
          this.showIcon6 =
            this.calculateAverage(this.data["A5"].slice(0, 15)) === 0;
          this.showIcon7 =
            this.calculateAverage(this.data["A6"].slice(0, 15)) === 0;
          this.showIcon8 =
            this.calculateAverage(this.data["A7"].slice(0, 15)) === 0;
          this.showIcon9 =
            this.calculateAverage(this.data["A8"].slice(0, 15)) === 0;
          this.showIcon10 =
            this.calculateAverage(this.data["A9"].slice(0, 15)) === 0;
          this.showIcon11 =
            this.calculateAverage(this.data["A10"].slice(0, 15)) === 0;
          this.showIcon12 =
            this.calculateAverage(this.data["A11"].slice(0, 15)) === 0;
          this.showIcon13 =
            this.calculateAverage(this.data["A12"].slice(0, 15)) === 0;
          this.showIcon14 =
            this.calculateAverage(this.data["A13"].slice(0, 15)) === 0;
          this.showIcon15 =
            this.calculateAverage(this.data["A14"].slice(0, 15)) === 0;
          this.showIcon16 =
            this.calculateAverage(this.data["A15"].slice(0, 15)) === 0;
          this.showIcon17 =
            this.calculateAverage(this.data["A16"].slice(0, 15)) === 0;
          this.showIcon18 =
            this.calculateAverage(this.data["A17"].slice(0, 15)) === 0;
          this.showIcon19 =
            this.calculateAverage(this.data["A18"].slice(0, 15)) === 0;
          this.showIcon20 =
            this.calculateAverage(this.data["A19"].slice(0, 15)) === 0;
          this.showIcon21 =
            this.calculateAverage(this.data["A20"].slice(0, 15)) === 0;
          this.updateDataFromCyton();
        })
        .catch((error) => {
          console.error("Connection failed", error);
          this.status = "Connection Failed";
        });
    },
    onDecodedCallback(data) {
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
    startRecording() {
      this.cytonBoard
        .startReading()
        .then(() => {
          console.log("Recording started");
        })
        .catch((error) => {
          console.error("Error starting recording:", error);
        });
    },
    stopRecording() {
      this.cytonBoard.stopReading(this.participantNumber).then(() => {
        console.log("Recording stopped");
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
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped>
/* Add your styles specific to this component if needed */
h2 {
  top: 10%;
  text-align: center;
}

.image-container {
  position: relative;
}

/* Center the icons relative to the image dimensions */
.v-icon-1 {
  position: absolute;
  top: 62.6%;
  left: 23%;
  transform: translate(-50%, -50%);
}

.v-icon-2 {
  position: absolute;
  top: 74%;
  left: 23%;
  transform: translate(-50%, -50%);
}

.v-icon-3 {
  position: absolute;
  top: 83.9%;
  left: 28%;
  transform: translate(-50%, -50%);
}

.v-icon-4 {
  position: absolute;
  top: 83.9%;
  left: 37.2%;
  transform: translate(-50%, -50%);
}

.v-icon-5 {
  position: absolute;
  top: 74%;
  left: 42.2%;
  transform: translate(-50%, -50%);
}

.v-icon-6 {
  position: absolute;
  top: 62.6%;
  left: 42.2%;
  transform: translate(-50%, -50%);
}

.v-icon-7 {
  position: absolute;
  top: 53%;
  left: 37.2%;
  transform: translate(-50%, -50%);
}

.v-icon-8 {
  position: absolute;
  top: 52.8%;
  left: 28%;
  transform: translate(-50%, -50%);
}

.v-icon-9 {
  position: absolute;
  top: 62.6%;
  left: 58%;
  transform: translate(-50%, -50%);
}

.v-icon-10 {
  position: absolute;
  top: 74%;
  left: 57.9%;
  transform: translate(-50%, -50%);
}

.v-icon-11 {
  position: absolute;
  top: 83.9%;
  left: 62.9%;
  transform: translate(-50%, -50%);
}

.v-icon-12 {
  position: absolute;
  top: 83.9%;
  left: 72.1%;
  transform: translate(-50%, -50%);
}

.v-icon-13 {
  position: absolute;
  top: 74%;
  left: 77.1%;
  transform: translate(-50%, -50%);
}

.v-icon-14 {
  position: absolute;
  top: 62.6%;
  left: 77.1%;
  transform: translate(-50%, -50%);
}

.v-icon-15 {
  position: absolute;
  top: 53%;
  left: 72.1%;
  transform: translate(-50%, -50%);
}

.v-icon-16 {
  position: absolute;
  top: 52.8%;
  left: 62.9%;
  transform: translate(-50%, -50%);
}

.v-icon-17 {
  position: absolute;
  top: 36.8%;
  left: 30.4%;
  transform: translate(-50%, -50%);
}

.v-icon-18 {
  position: absolute;
  top: 21.3%;
  left: 37.3%;
  transform: translate(-50%, -50%);
}

.v-icon-19 {
  position: absolute;
  top: 13.9%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.v-icon-20 {
  position: absolute;
  top: 21.3%;
  left: 63.4%;
  transform: translate(-50%, -50%);
}

.v-icon-21 {
  position: absolute;
  top: 36.8%;
  left: 69.8%;
  transform: translate(-50%, -50%);
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
  background-color: rgba(0, 0, 0, 0.8); /* Semi-transparent overlay */
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
  width: 50% %; /* Ensure each chart takes up full width of its container */
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
/* Continue this pattern for the rest of the icons */
</style>
