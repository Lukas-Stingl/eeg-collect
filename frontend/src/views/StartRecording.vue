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
/* Add your component-specific styles here */
</style>
