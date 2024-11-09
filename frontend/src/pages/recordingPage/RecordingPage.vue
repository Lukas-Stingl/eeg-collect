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
  <BasePage heading="Recording">
    <p
      style="
        color: #737373;
        text-align: center;
        font-weight: 500;
        font-size: 18px;
      "
    >
      Recording in progress. You can now return to the experiment Tab.<br />
    </p>
  </BasePage>
</template>
