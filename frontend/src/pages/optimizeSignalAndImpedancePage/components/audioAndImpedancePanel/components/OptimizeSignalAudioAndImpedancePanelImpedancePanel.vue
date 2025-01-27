<script setup lang="ts">
import { ref, watch, defineEmits, onMounted, defineProps } from "vue";
import { PhArrowRight } from "@phosphor-icons/vue";
import { LottieAnimation } from "lottie-web-vue";
import { useRoute } from "vue-router";

import CircularDots from "@/assets/CircularDots.json";
import DynamicGradient from "@/assets/DynamicGradient.json";
import { navigateToRestricted } from "@/router";
import { ROUTES } from "@/utils/routes";

const emit = defineEmits(["close"]);

const props = defineProps<{
  isImpedanceCheckRunning: boolean;
  impedanceCheckChannel: number;
  runImpedanceCheck: () => Promise<void>;
}>();

// ---- STATE ----

let anim = ref();
let animBackground = ref();

const route = useRoute();

const isImpedanceCheckFinished = ref(false);

const progressValue = ref(0);
const bufferValue = ref(20);
const interval = ref(0);

// ---- CALLBACKS ----

const handleContinue = () => {
  emit("close");

  navigateToRestricted(ROUTES.RECORDING, route.query);
};

const startBuffer = () => {
  clearInterval(interval.value);

  // Reset progress values
  progressValue.value = 0;
  bufferValue.value = 0;

  // Calculate the total time and interval duration
  const totalTime = 6000; // 5 seconds in milliseconds
  const steps = 100; // Number of steps to complete progress
  const intervalDuration = totalTime / steps;

  // Start the interval to update progress
  interval.value = setInterval(() => {
    // Increment progress values
    progressValue.value += 100 / steps;
    bufferValue.value += 100 / steps;

    // Check if progress has reached 100%
    if (progressValue.value >= 100) {
      // Ensure the progress bar is exactly at 100%
      progressValue.value = 100;
      bufferValue.value = 100;
      // Stop the interval after the delay
      clearInterval(interval.value);
    }
  }, intervalDuration);
};

// ---- LIFECYCLE HOOKS ----

watch(
  () => props.isImpedanceCheckRunning,
  (newValue) => {
    if (newValue) {
      startBuffer();
    }
  },
);

onMounted(async () => {
  props.runImpedanceCheck().then(() => (isImpedanceCheckFinished.value = true));
});
</script>

<template>
  <!-- Background Animation -->

  <VCol style="overflow: hidden; z-index: 900">
    <LottieAnimation
      class="flex-grow-1"
      style="justify-content: center; align-items: center; z-index: 900"
      ref="animBackground"
      :animation-data="DynamicGradient"
      :loop="true"
      :auto-play="true"
      :speed="1"
    />
  </VCol>

  <!-- Content -->

  <VCol
    class="flex-grow-1 d-flex h-100 pt-12"
    style="
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1000;
    "
  >
    <VCol class="flex-grow-1 justify-space-between align-center">
      <h1 class="mb-3" style="font-size: 38px; color: #1a2b5a">
        Impedance Measurements
      </h1>

      <p
        class="mb-2"
        style="
          color: #737373;
          text-align: center;
          font-weight: 500;
          font-size: 18px;
          transition: margin-bottom 0.5s ease-in-out;
          width: 500px;
        "
      >
        Resistance measurements for each electrode. <br />
        You will be able to start your session after this step.
      </p>

      <VCol
        style="width: 210px; min-height: 210px"
        class="mt-4 mb-8 d-flex justify-center align-center rounded-circle overflow-hidden position-relative"
      >
        <LottieAnimation
          style="
            width: 200px;
            justify-content: center;
            align-items: center;
            position: relative;
          "
          ref="anim"
          :animation-data="CircularDots"
          :loop="true"
          :auto-play="true"
          :speed="1"
        />
      </VCol>

      <VRow
        class="ga-5 align-center justify-end position-relative w-100 px-8"
        style="
          min-height: 60px;
          background: rgba(255, 255, 255, 0.45);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        "
      >
        <v-progress-linear
          class="mr-auto position-absolute"
          style="width: 150px; height: 5px; left: 100px; top: 50%"
          v-model="progressValue"
          :buffer-value="bufferValue"
          rounded
          color="#000000"
        />

        <p
          style="
            color: #737373;
            font-weight: 500;
            font-size: 13px;
            position: absolute;
            left: 185px;
            top: 36%;
          "
        >
          {{ props.impedanceCheckChannel }}/8
        </p>

        <VRow class="align-start justify-center">
          <VBtn
            class="flex-grow-0 flex-shrink-1 d-flex"
            :disabled="!isImpedanceCheckFinished"
            :append-icon="PhArrowRight"
            @click="handleContinue"
            >Continue</VBtn
          >
        </VRow>
      </VRow>
    </VCol>
  </VCol>
</template>

<style scoped>
.expanded {
  min-height: 300px;
  transition: min-height 1.5s ease-in-out;
}

.deflate {
  opacity: 0;
  min-height: 0;
  max-height: 0;
  transition:
    min-height 1s ease-in-out,
    opacity 0.6s ease-in-out,
    max-height 0.5s ease-out;
}
</style>
