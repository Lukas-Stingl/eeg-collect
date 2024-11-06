<script setup lang="ts">
import { onMounted } from "vue";

import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";

// ---- STATE ----
useConfigureParticipantId();
const ws = useWebsocketConnection();
const { startSignalQualityCheck, stopRecording, signalRMS } = useOpenBCIUtils();

// ---- LIFECYCLE HOOKS ----

onMounted(() => {
  console.log(ws);
  // Start the signal quality check in the background
  startSignalQualityCheck();

  console.log("999999999999999999999999999999999999999999999999999999");
  setTimeout(() => {
    console.log("JNON");
    stopRecording();
  }, 15000);
});
</script>

<template>
  <BasePage heading="Optimize Headphones Position">
    <div>{{ signalRMS }}</div>
    <div v-for="(rms, index) in signalRMS" :key="index">{{ rms }}</div>
  </BasePage>
</template>
