<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";

// ---- STATE ----
useConfigureParticipantId();
useWebsocketConnection();
const { startSignalQualityCheck, stopRecording, signalRMS } = useOpenBCIUtils();
</script>

<template>
  <BasePage heading="Recording">Recording</BasePage>
</template>
