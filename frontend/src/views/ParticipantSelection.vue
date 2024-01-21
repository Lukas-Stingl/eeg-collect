<template>
  <div>
    <div class="header">
      <h2>Bitte geben Sie Ihre Teilnehmernummer an.</h2>
    </div>

    <v-text-field id="participantNr" class="input-field" label="Teilnehmernummer"></v-text-field>

    <div class="input-container">
      <div class="help-button">
        <!-- Vue button for "Weiter zur Geräteüberprüfung" -->
        <button class="vue-button weiter-button" @click="connectToCyton">Weiter</button>

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
</template>

<script>
import { cyton } from '../scripts/cyton.js';

export default {
  name: 'ParticipantSelection',
  data() {
    return {
      participantNumber: '',
      isHelpOpen: false,
      status: 'Not connected',
      data: {},
      cytonBoard: null,
    };
  },
  methods: {
    redirectToDeviceCheck() {
      // Redirect to the /check route
      this.$router.push('/check');
      this.toggleHelp();
    },
    connectToCyton() {
      this.cytonBoard.setupSerialAsync()
        .then(() => {
          this.status = 'Connected to Cyton';
          this.redirectToDeviceCheck();
        })
        .catch((error) => {
          console.error('Connection failed', error);
          this.status = 'Connection Failed';
        });
    },
    toggleHelp() {
      this.isHelpOpen = !this.isHelpOpen;
    }
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
};
</script>

<style scoped>
/* Add your styles specific to this component if needed */

.input-container {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.vue-button {
  background-color: #00876C;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.header {
  display: flex;
  justify-content: center;
}

.vue-button:hover {
  background-color: #005842;
}

.help-modal {
  margin-top: 10px;
}

/* Style for the help button */
.help-button {
  cursor: pointer;
}

.help {
  margin-left: 10px;
}

.input-field {
  margin-top: 50px;
  margin-bottom: 50px;
}


</style>
