<!-- StartRecording.vue -->
<template>
  <div>
    <h1>Cyton Connector</h1>
    <button @click="connectToCyton">Connect to Cyton</button>
    <button @click="receiveData">Receive Data</button>
    <p id="status">{{ status }}</p>
    <div id="data-display">
      <p v-for="(value, channel) in data" :key="channel">{{ channel }}: {{ value }}</p>
    </div>
    <button @click="startRecording">Start Recording</button>
    <button @click="stopRecording">Stop Recording</button>
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

    onConnectedCallback() {
      // Handle successful connection here
    },
    onDisconnectedCallback() {
      // Handle disconnection here
    },
  },
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>
