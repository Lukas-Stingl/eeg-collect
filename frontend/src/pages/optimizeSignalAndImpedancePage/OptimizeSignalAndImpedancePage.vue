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
const { startSignalQualityCheck, stopRecording } = useOpenBCIUtils();

// ---- LIFECYCLE HOOKS ----

onMounted(() => {
  console.log(ws);
  // Start the signal quality check in the background
  startSignalQualityCheck();

  console.log("999999999999999999999999999999999999999999999999999999");
  setTimeout(() => {
    console.log("JNON");
    stopRecording();
  }, 5000);
});
</script>

<template>
  <BasePage heading="Optimize Headphones Position">Hallo</BasePage>
</template>
