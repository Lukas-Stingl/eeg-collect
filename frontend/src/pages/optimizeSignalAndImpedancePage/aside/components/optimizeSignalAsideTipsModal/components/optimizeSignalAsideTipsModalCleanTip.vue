<script setup lang="ts">
import { PhArrowRight } from "@phosphor-icons/vue";
import { defineEmits } from "vue";

const emit = defineEmits(["close"]);

// ---- CALLBACKS ----

const handleContinue = () => {
  emit("close");
};
</script>

<template>
  <VCol
    class="flex-grow-1 d-flex h-100"
    style="
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 2100;
    "
  >
    <VCol class="pa-6 flex-grow-1">
      <VCardTitle class="pa-0 mb-8">
        Tip 2: Wipe your ears and skin
      </VCardTitle>

      <VCol class="px-2">
        <VCol class="ga-10">
          <v-img src="@/assets/EarWipes.png" style="height: 230px"></v-img>
          <p
            style="
              color: #737373;
              text-align: justify;
              font-weight: 500;
              font-size: 14px;
            "
          >
            Wiping your skin with the disinfectant wipes significantly increase
            the contact of the electrodes. For a higher signal quality, try to
            put on the headphones immediately after wiping your skin.
          </p>
        </VCol>
      </VCol>
    </VCol>

    <VRow
      class="ga-5 align-center justify-space-between position-relative w-100 px-8"
      style="
        min-height: 60px;
        background: rgba(255, 255, 255, 0.45);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      "
    >
      <p style="color: #737373; font-weight: 500; font-size: 13px">2/2</p>

      <VRow class="align-start justify-center">
        <VBtn
          class="flex-grow-0 flex-shrink-1 d-flex"
          :append-icon="PhArrowRight"
          @click="handleContinue"
          >Next Tip</VBtn
        >
      </VRow>
    </VRow>
  </VCol>
</template>

<style scoped></style>
