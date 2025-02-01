<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";

import { PhX } from "@phosphor-icons/vue";
import OptimizeSignalAsideTipsModalElectronicTip from "@/pages/optimizeSignalAndImpedancePage/aside/components/optimizeSignalAsideTipsModal/components/optimizeSignalAsideTipsModalElectronicTip.vue";
import OptimizeSignalAsideTipsModalCleanTip from "@/pages/optimizeSignalAndImpedancePage/aside/components/optimizeSignalAsideTipsModal/components/optimizeSignalAsideTipsModalCleanTip.vue";

const emit = defineEmits(["close"]);

defineProps({
  modalModel: {
    type: Boolean,
    required: true,
  },
});

// ---- STATE ----

const carouselModel = ref(0);

// ---- CALLBACKS ----

const handleNextStep = () => {
  if (carouselModel.value === 1) {
    carouselModel.value = 0;
    return;
  }

  carouselModel.value = 1;
};

const handleClose = () => {
  emit("close");
  carouselModel.value = 0;
};
</script>

<template>
  <VCol
    v-if="modalModel"
    style="
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(32, 32, 32, 0.73);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      backdrop-filter: blur(3.5px);
      -webkit-backdrop-filter: blur(3.5px);
      z-index: 1300;
      justify-content: center;
      align-items: center;
    "
  >
    <VCard width="85vh" style="top: 50px">
      <VBtn
        class="rounded-circle position-absolute d-flex justify-center align-center"
        @click="handleClose"
        style="
          top: 15px;
          right: 15px;
          min-width: 0 !important;
          width: 32px;
          height: 32px;
          z-index: 10000000;
        "
      >
        <PhX size="20" />
      </VBtn>

      <VCarousel hide-delimiters :show-arrows="false" v-model="carouselModel">
        <VCarouselItem class="h-100" style="height: 100%" value="0">
          <OptimizeSignalAsideTipsModalElectronicTip @close="handleNextStep" />
        </VCarouselItem>

        <VCarouselItem class="h-100" style="height: 100%" value="1">
          <OptimizeSignalAsideTipsModalCleanTip @close="handleNextStep" />
        </VCarouselItem>
      </VCarousel>
    </VCard>
  </VCol>
</template>

<style scoped></style>
