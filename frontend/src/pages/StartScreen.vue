<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { navigateToRestricted } from "@/router";
import { ROUTES } from "@/utils/routes";

// ---- STATE ----

const router = useRouter();
const route = useRoute();

const buttonText = ref("Weiter");
const showSecondBox = ref(false);

const message = ref(
  "Bitte ziehen Sie die Kopfhörer auf und achten Sie darauf, dass die Kopfhörer möglichst gut auf der Haut liegen. " +
    "Schauen Sie bitte, dass sich nach Möglichkeit keine Haare zwischen den Kopfhörern und der Haut befinden. Achten Sie bitte auch darauf, dass die Ausrichtung der Kopfhörer stimmt. Der linke Kopfhörer ist mit einem L, der rechte mit einem R gekennzeichnet. Klicken Sie bitte anschließend auf Weiter.",
);

// ---- CALLBACKS ----

const showSecondTextBox = () => (showSecondBox.value = true);

const redirectToRecording = () =>
  navigateToRestricted(ROUTES.RECORDING, route.query);
</script>

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
