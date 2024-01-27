<template>
  <div>
    <div v-if="!participantNumberSet">
      <!-- Participant Number Input Page -->
      <div class="header">
        <h2>Bitte geben Sie Ihre Teilnehmernummer an.</h2>
      </div>

      <v-text-field id="participantNr" class="input-field" label="Teilnehmernummer"></v-text-field>

      <div class="input-container">
        <div class="help-button">
          <!-- Vue button for "Weiter zur Geräteüberprüfung" -->
          <v-btn class="vue-button weiter-button" @click="setParticipantNumberAndContinue">Weiter</v-btn>

          <v-icon class="help" color="info" icon="mdi-help-circle-outline" size="x-small" @click="toggleHelp"></v-icon>
        </div>
      </div>

      <v-dialog v-model="isHelpOpen" max-width="500px">
        <v-card>
          <v-card-title>Hilfe</v-card-title>
          <v-card-text>
            Im Folgenden verbinden Sie bitte Ihr Gerät. Verwenden Sie den entsprechenden Port des Headsets. Dieser heißt in Ihrem Fall XXX.
          </v-card-text>
          <v-card-actions>
            <v-btn @click="toggleHelp">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
  <div>
    <h2 v-if="showContinueButton && participantNumberSet">Device Check</h2>
    <h1 v-if="!showContinueButton && participantNumberSet">Cyton Connector</h1>

    <v-container v-if="showContinueButton && participantNumberSet ">
      <!-- Device Check Content -->
      <v-row justify="center">
        <v-col cols="12" md="6" class="image-container">
          <div>
            
        
            <v-container>
              <v-row justify="center">
                <v-col cols="12" md="6" class="image-container">
                  <v-img
                    :src="require('@/assets/headphones.png')"
                    class="my-3"
                    contain
                    max-height="400"
                    max-width="648"
                  />
        
        
        <v-icon v-if="showIcon1" class="v-icon-1" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon2" class="v-icon-2" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon3" class="v-icon-3" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon4" class="v-icon-4" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon5" class="v-icon-5" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon6" class="v-icon-6" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon7" class="v-icon-7" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon8" class="v-icon-8" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon9" class="v-icon-9" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon10" class="v-icon-10" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon11" class="v-icon-11" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon12" class="v-icon-12" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon13" class="v-icon-13" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon14" class="v-icon-14" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon15" class="v-icon-15" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon16" class="v-icon-16" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon17" class="v-icon-17" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon18" class="v-icon-18" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon19" class="v-icon-19" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon20" class="v-icon-20" color="red" size="15">mdi-alert-outline</v-icon>
                  <v-icon v-if="showIcon21" class="v-icon-21" color="red" size="15">mdi-alert-outline</v-icon>
                </v-col>
                
              </v-row>
            </v-container>
          </div>
        
        <div class="help-class">
                      <v-icon class="help" color="info" icon="mdi-help-circle-outline" size="x-small" @click="toggleHelp" style="z-index: 9999999;"></v-icon>
        
        </div>
        <div class="continue">
        <v-btn @click="redirectToStartRecording">Weiter</v-btn>
        </div>
        
                      <v-dialog v-model="isHelpOpen" max-width="500px">
                    <v-card>
                      <v-card-title>Hilfe</v-card-title>
                      <v-card-text>
                        Falls einzelne Kanäle ein Fehlersymbol anzeigen, schalten Sie das Gerät bitte aus und wieder ein und achten Sie darauf, dass die Elektrotroden korrekt angebracht sind.
                      </v-card-text>
                      <v-card-actions>
                        <v-btn @click="toggleHelp">Close</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
        </v-col>
      </v-row>

 

      <v-dialog v-model="isHelpOpen" max-width="500px">
        <v-card>
          <v-card-title>Hilfe</v-card-title>
          <v-card-text>
            Falls einzelne Kanäle ein Fehlersymbol anzeigen, schalten Sie das Gerät bitte aus und wieder ein und achten Sie darauf, dass die Elektrotroden korrekt angebracht sind.
          </v-card-text>
          <v-card-actions>
            <v-btn @click="toggleHelp">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <div v-if="!showContinueButton  && participantNumberSet">
      <!-- Cyton Connector Content -->
      <v-btn @click="connectToCyton">Connect to Cyton</v-btn>
      <p id="status">{{ status }}</p>
      <div id="data-display">
        <p v-for="(value, channel) in data" :key="channel">{{ channel }}: {{ value }}</p>
      </div>
      <v-btn @click="startRecording">Start Recording</v-btn>
      <v-btn @click="stopRecording">Stop Recording</v-btn>
    </div>
  </div>
</template>

<script>
import { cyton } from '../scripts/cyton.js';

export default {
  data() {
    return {
      status: 'Not connected',
      data: {},
      cytonBoard: null,
      participantNumberSet: false,
      showContinueButton: true,
      showIcon1: Math.random() < 0.5,
      showIcon2: Math.random() < 0.5,
      showIcon3: Math.random() < 0.5,
      showIcon4: Math.random() < 0.5,
      showIcon5: Math.random() < 0.5,
      showIcon6: Math.random() < 0.5,
      showIcon7: Math.random() < 0.5,
      showIcon8: Math.random() < 0.5,
      showIcon9: Math.random() < 0.5,
      showIcon10: Math.random() < 0.5,
      showIcon11: Math.random() < 0.5,
      showIcon12: Math.random() < 0.5,
      showIcon13: Math.random() < 0.5,
      showIcon14: Math.random() < 0.5,
      showIcon15: Math.random() < 0.5,
      showIcon16: Math.random() < 0.5,
      showIcon17: Math.random() < 0.5,
      showIcon18: Math.random() < 0.5,
      showIcon19: Math.random() < 0.5,
      showIcon20: Math.random() < 0.5,
      showIcon21: Math.random() < 0.5,
    };
  },
  mounted() {
    this.cytonBoard = new cyton(
      this.onDecodedCallback,
      this.onConnectedCallback,
      this.onDisconnectedCallback,
      '',
      'CustomDecoder',
      115200,
    );
  },
  methods: {
    connectToCyton() {
      this.cytonBoard.setupSerialAsync()
        .then(() => {
          this.status = 'Connected to Cyton';
        })
        .catch((error) => {
          console.error('Connection failed', error);
          this.status = 'Connection Failed';
        });
    },
    receiveData() {
      for (let channel of ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']) {
        let data = this.cytonBoard.getLatestData(channel, 1);
        this.$set(this.data, channel, data[0]);
      }
    },
    startRecording() {
      this.cytonBoard.startReading()
        .then(() => {
          console.log('Recording started');
        })
        .catch((error) => {
          console.error('Error starting recording:', error);
        });
    },
    stopRecording() {
      this.cytonBoard.stopReading()
        .then(() => {
          console.log('Recording stopped');
        });
    },

    redirectToStartRecording() {
      this.showContinueButton = false
    },
    setParticipantNumberAndContinue() {
      this.participantNumberSet = true
    },
  },
};
</script>

<style scoped>
/* Add your styles specific to this component if needed */
h2 {
  text-align: center;
}

.image-container {
  position: relative;
}

/* Center the icons relative to the image dimensions */
.v-icon-1 {
  position: absolute;
  top: 62%;
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
  top: 82.5%;
  left: 28%;
  transform: translate(-50%, -50%);
}

.v-icon-4 {
  position: absolute;
  top: 82.5%;
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
  top: 62%;
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
  top: 62%;
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
  top: 82.5%;
  left: 62.9%;
  transform: translate(-50%, -50%);
}

.v-icon-12 {
  position: absolute;
  top: 82.5%;
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
  top: 62%;
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
  top: 38.2%;
  left: 30.4%;
  transform: translate(-50%, -50%);
}

.v-icon-18 {
  position: absolute;
  top: 22.3%;
  left: 37.3%;
  transform: translate(-50%, -50%);
}

.v-icon-19 {
  position: absolute;
  top: 15.3%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.v-icon-20 {
  position: absolute;
  top: 22.3%;
  left: 63.4%;
  transform: translate(-50%, -50%);
}

.v-icon-21 {
  position: absolute;
  top: 38.2%;
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
.help-class{
    display: flex;
    justify-content: flex-end;
}

/* Continue this pattern for the rest of the icons */
</style>
