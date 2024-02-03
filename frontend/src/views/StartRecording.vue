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
        <h2>Bitte geben Sie Ihre Teilnehmernummer an.</h2>
      </div>
      <div class="input">
        <v-text-field
          id="participantNr"
          class="input-field"
          label="Teilnehmernummer"
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
            @click="toggleHelp"
          ></v-icon>
        </div>

        <v-dialog v-model="isHelpOpen" max-width="500px">
          <v-card>
            <v-card-title>Hilfe</v-card-title>
            <v-card-text>
              Im Folgenden verbinden Sie bitte Ihr Gerät. Verwenden Sie den
              entsprechenden Port des Headsets. Dieser heißt in Ihrem Fall XXX.
            </v-card-text>
            <v-card-actions>
              <v-btn @click="toggleHelp">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <h2 v-if="showContinueButton && participantNumberSet">Device Check</h2>
    <h1 v-if="!showContinueButton && participantNumberSet">Cyton Connector</h1>

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

      <div class="help-class">
        <v-icon
          class="help"
          color="info"
          icon="mdi-help-circle-outline"
          size="x-small"
          @click="toggleHelp"
          style="z-index: 9999999"
        ></v-icon>
      </div>
      <div class="button-container">
        <v-btn @click="redirectToStartRecording">Weiter</v-btn>
      </div>

      <v-dialog v-model="isHelpOpen" max-width="500px">
        <v-card>
          <v-card-title>Hilfe</v-card-title>
          <v-card-text>
            Falls einzelne Kanäle ein Fehlersymbol anzeigen, schalten Sie das
            Gerät bitte aus und wieder ein und achten Sie darauf, dass die
            Elektrotroden korrekt angebracht sind.
          </v-card-text>
          <v-card-actions>
            <v-btn @click="toggleHelp">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <div v-if="!showContinueButton && participantNumberSet">
      <!-- Cyton Connector Content -->
      <v-btn @click="connectToCyton">Connect to Cyton</v-btn>
      <p id="status">{{ status }}</p>
      <div id="data-display">
        <p v-for="(value, channel) in data" :key="channel">
          {{ channel }}: {{ value }}
        </p>
      </div>
      <v-btn @click="startRecording">Start Recording</v-btn>
      <v-btn @click="stopRecording">Stop Recording</v-btn>
    </div>
  </div>
</template>

<script>
import { cyton } from "../scripts/cyton.js";

export default {
  data() {
    return {
      status: "Not connected",
      data: {},
      cytonBoard: null,
      participantNumberSet: false,
      showContinueButton: true,
      loading: false, // Add loading state
      minWidth: 960,
      maxWidthPercent: 70,
      showIcon1: Math.random() < 2,
      showIcon2: Math.random() < 2,
      showIcon3: Math.random() < 2,
      showIcon4: Math.random() < 2,
      showIcon5: Math.random() < 2,
      showIcon6: Math.random() < 2,
      showIcon7: Math.random() < 2,
      showIcon8: Math.random() < 2,
      showIcon9: Math.random() < 2,
      showIcon10: Math.random() < 2,
      showIcon11: Math.random() < 2,
      showIcon12: Math.random() < 2,
      showIcon13: Math.random() < 2,
      showIcon14: Math.random() < 2,
      showIcon15: Math.random() < 2,
      showIcon16: Math.random() < 2,
      showIcon17: Math.random() < 2,
      showIcon18: Math.random() < 2,
      showIcon19: Math.random() < 2,
      showIcon20: Math.random() < 2,
      showIcon21: Math.random() < 2,
    };
  },
  mounted() {
    this.cytonBoard = new cyton(
      this.onDecodedCallback,
      this.onConnectedCallback,
      this.onDisconnectedCallback,
      "",
      "CustomDecoder",
      115200
    );
    window.addEventListener("resize", this.handleResize);
  },
  computed: {
    colWidth() {
      return window.innerWidth >= this.minWidth ? "50%" : "100%";
    },
  },
  methods: {
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
        .then(() => {
          this.loading = false;
          this.participantNumberSet = true;
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
    receiveData() {
      for (let channel of [
        "A0",
        "A1",
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "A8",
      ]) {
        let data = this.cytonBoard.getLatestData(channel, 1);
        this.$set(this.data, channel, data[0]);
      }
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
      this.cytonBoard.stopReading().then(() => {
        console.log("Recording stopped");
      });
    },

    redirectToStartRecording() {
      this.showContinueButton = false;
    },
    async setParticipantNumberAndContinue() {
      await this.deviceCheck();
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
  top: 10px;
  right: 10px;
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
  position: absolute;
  margin-top: 35px;
  left: 50%;
  transform: translate(-50%, -50%);
}
.input {
  margin-top: 50px;
  max-width: 300px;
  display: flex;
  justify-content: center;
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
/* Continue this pattern for the rest of the icons */
</style>
