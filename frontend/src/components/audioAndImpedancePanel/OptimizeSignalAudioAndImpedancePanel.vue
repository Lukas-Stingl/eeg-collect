<script setup lang="ts">
import { ref, defineProps } from "vue";

import OptimizeSignalAudioAndImpedancePanelAudioPanel from "@/components/audioAndImpedancePanel/components/OptimizeSignalAudioAndImpedancePanelAudioPanel.vue";
import OptimizeSignalAudioAndImpedancePanelImpedancePanel from "@/components/audioAndImpedancePanel/components/OptimizeSignalAudioAndImpedancePanelImpedancePanel.vue";

defineProps<{
  isSetup?: boolean;
  nextRoute: string;
  impedancePanelDescription?: string;
  stopRecording: () => Promise<void>;
  runImpedanceCheck: () => Promise<void>;
  isImpedanceCheckRunning: boolean;
  impedanceCheckChannel: number;
}>();

// ---- STATE ----

const carouselModel = ref(0);

// ---- CALLBACKS ----

const handleNextStep = () => (carouselModel.value += 1);
</script>

<template>
  <VCol
    style="
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(32, 32, 32, 0.73);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      backdrop-filter: blur(3.5px);
      -webkit-backdrop-filter: blur(3.5px);
      z-index: 2000;
      justify-content: center;
      align-items: center;
    "
  >
    <VCard width="85vh" style="top: 50px">
      <VCarousel hide-delimiters :show-arrows="false" v-model="carouselModel">
        <VCarouselItem class="h-100" style="height: 100%" value="0">
          <OptimizeSignalAudioAndImpedancePanelAudioPanel
            @close="handleNextStep"
          />
        </VCarouselItem>

        <VCarouselItem class="h-100" style="height: 100%" value="1">
          <OptimizeSignalAudioAndImpedancePanelImpedancePanel
            :isImpedanceCheckRunning="isImpedanceCheckRunning"
            :impedanceCheckChannel="impedanceCheckChannel"
            :runImpedanceCheck="runImpedanceCheck"
            :nextRoute="nextRoute"
            :description="impedancePanelDescription"
            :stop-recording="stopRecording"
          />
        </VCarouselItem>
      </VCarousel>
    </VCard>
  </VCol>
</template>

<style scoped></style>
