<template>
  <div>
    <div class="header">
      <h2>Einführung</h2>
    </div>
    <div class="container">
      <div class="textbox">
        {{ message }}
      </div>
      <v-btn @click="showSecondTextBox">{{ buttonText }}</v-btn>
    </div>
    <v-dialog v-model="showSecondBox" max-width="500px">
      <v-card>
        <v-card-title>Eingabe der Teilnehmernummer</v-card-title>
        <v-card-text>
          Bitte geben Sie nachfolgend die Ihnen übermittelte Teilnehmernummer
          ein.
        </v-card-text>
        <v-card-actions class="text-right">
          <!-- Here, we add text-right class -->
          <v-btn @click="redirectToRecording">Weiter</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "StartScreen",
  data() {
    return {
      message:
        "Bitte ziehen Sie die Kopfhörer auf und achten Sie darauf, dass die Kopfhörer möglichst gut auf der Haut liegen. " +
        "Schauen Sie bitte, dass sich nach Möglichkeit keine Haare zwischen den Kopfhörern und der Haut befinden. Achten Sie bitte auch darauf, dass die Ausrichtung der Kopfhörer stimmt. Der linke Kopfhörer ist mit einem L, der rechte mit einem R gekennzeichnet. Klicken Sie bitte anschließend auf Weiter.",
      buttonText: "Weiter",
      showSecondBox: false,
    };
  },
  methods: {
    showSecondTextBox() {
      this.showSecondBox = true;
    },
    redirectToRecording() {
      const queryParams = this.$route.query;
      this.$router.push({ path: "/recording", query: queryParams });
    },
  },
  mounted() {
    // Any mounted logic you might need
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}
.text-right {
  text-align: right;
}
.textbox {
  margin-bottom: 50px;
  width: 600px;
  text-align: justify;
}

textarea {
  width: 300px;
  height: 100px;
  resize: none;
}
</style>
