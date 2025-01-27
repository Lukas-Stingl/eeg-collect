<script setup lang="ts">
import { onMounted, ref } from "vue";

import OptimizeSignalAudioAndImpedancePanelAudioPanel from "@/pages/optimizeSignalAndImpedancePage/components/audioAndImpedancePanel/components/OptimizeSignalAudioAndImpedancePanelAudioPanel.vue";
import OptimizeSignalAudioAndImpedancePanelImpedancePanel from "@/pages/optimizeSignalAndImpedancePage/components/audioAndImpedancePanel/components/OptimizeSignalAudioAndImpedancePanelImpedancePanel.vue";
import { useOpenBCIUtils } from "@/utils/hooks";

// ---- STATE ----

const carouselModel = ref(0);

const {
  startSignalQualityCheck,
  runImpedanceCheck,
  isImpedanceCheckRunning,
  impedanceCheckChannel,
} = useOpenBCIUtils();

// ---- CALLBACKS ----

const handleNextStep = () => {
  console.log("Next step");
  carouselModel.value += 1;
};

onMounted(() => {
  startSignalQualityCheck();
});
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
          />
        </VCarouselItem>
      </VCarousel>
    </VCard>
  </VCol>
</template>

<style scoped></style>
