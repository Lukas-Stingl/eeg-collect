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
  <VCol class="h-100 d-flex">
    <VCol class="pa-6 flex-grow-1">
      <VCardTitle class="pa-0 mb-8">
        Tip 1: Unplug electronic devices in your environment
      </VCardTitle>

      <VCol class="px-2">
        <VCol class="ga-2">
          <v-img src="@/assets/StandingDesk.png" style="height: 230px"></v-img>
          <p
            style="
              color: #737373;
              text-align: justify;
              font-weight: 500;
              font-size: 14px;
            "
          >
            Large electronic devices that require wall socket power, such as
            <b>computers</b>, <b>monitors</b>, and <b>standing desks</b>, may
            have poor electromagnetic shielding, which can interfere with the
            EEG Headset. To improve signal quality, pull the plug of your
            devices for the duration of the experiment. Battery powered devices,
            such as Laptops are not a problem.
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
      <p style="color: #737373; font-weight: 500; font-size: 13px">1/2</p>

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
