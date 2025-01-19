<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";
import { computed, ComputedRef, onMounted, ref, watch } from "vue";

// ---- STATE ----
useConfigureParticipantId();
useWebsocketConnection();
const { startRecording, stopRecording } = useOpenBCIUtils();

onMounted(() => {
  startRecording();
});
</script>

<template>
  <BasePage heading="Recording">
    <p
      class="mb-5"
      style="
        color: #737373;
        text-align: center;
        font-weight: 500;
        font-size: 18px;
      "
    >
      Recording in progress. You can now return to the experiment Tab.<br />
    </p>

    <v-btn @click="stopRecording">Stop Recording</v-btn>
  </BasePage>
</template>
