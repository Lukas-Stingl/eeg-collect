<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import Breathing from "@/assets/Breathing.json";
import DynamicGradient from "@/assets/DynamicGradient.json";
import { LottieAnimation } from "lottie-web-vue";
import { PhArrowRight } from "@phosphor-icons/vue";
import audioFile from "@/assets/40HzAudio.mp3";

let anim = ref();
let animBackground = ref();

const hasUserReadInstructions = ref(false);

let audio = new Audio(audioFile);
const isAudioPlaying = computed(
  () => hasUserReadInstructions.value && !isTimerFinished.value,
);
// TIMER

const progress = ref(0);
let timer: number | undefined;
const isTimerFinished = ref(false);

watch(
  () => isAudioPlaying.value,
  () => {
    if (isAudioPlaying.value) {
      audio.play();
    } else {
      audio.pause();
    }
  },
);

watch(
  () => hasUserReadInstructions.value,
  () => {
    console.log("A");
    timer = setInterval(() => {
      console.log("B");
      if (progress.value < 100) {
        console.log("C");
        progress.value += 1.67; // 100 / 60 = 1.67 (approximately)
      } else {
        isTimerFinished.value = true;
        clearInterval(timer);
      }
    }, 1000);
  },
);

watch(progress, () => console.log(progress));

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <!-- Background Animation -->

  <VCol
    style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: 900;
      background: white;
    "
  >
    <LottieAnimation
      class="flex-grow-1"
      style="
        width: 100vw !important;

        justify-content: center;
        align-items: center;
        z-index: 900;
      "
      ref="animBackground"
      :animation-data="DynamicGradient"
      :loop="true"
      :auto-play="true"
      :speed="1"
    />
  </VCol>

  <!-- Content -->

  <VCol
    style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: 1000;
    "
  >
    <VCol
      class="flex-grow-1 justify-end align-center mb-12"
      style="padding-top: 80px"
    >
      <h1 class="mb-5" style="font-size: 38px; color: #09347c">Please Rest</h1>

      <p
        class="mb-3"
        style="
          color: #737373;
          text-align: center;
          font-weight: 500;
          font-size: 18px;
        "
      >
        Turn up your volume and listen to the audio. <br />
        After one minute, you can continue to the Impedance Check.
      </p>

      <p
        :class="{ deflate: hasUserReadInstructions }"
        :style="{
          color: '#737373',
          fontWeight: '500',
          fontSize: '18px',
          minHeight: !hasUserReadInstructions ? '200px' : '0px',
          opacity: !hasUserReadInstructions ? '100%' : '0',
          maxWidth: '500px',
          textAlign: 'justify',
        }"
      >
        Please breathe normally and keep your body relaxed. A baseline
        measurement will be recorded. After one minute, you can continue to the
        next step, which will be the impedance recording.
        <br />
        <br />
        If you are ready, click the continue button.
      </p>

      <VCol
        :style="{
          width: '300px',
          minHeight: hasUserReadInstructions ? '300px' : '0px',
        }"
        :class="{ expanded: hasUserReadInstructions }"
        class="mt-8 d-flex justify-center align-center rounded-circle overflow-hidden position-relative"
      >
        <LottieAnimation
          style="
            width: 350px;
            justify-content: center;
            align-items: center;
            top: -20px;
            position: relative;
          "
          ref="anim"
          :animation-data="Breathing"
          :loop="true"
          :auto-play="true"
          :speed="1"
        />
      </VCol>
    </VCol>

    <VCol class="ga-5 align-center justify-start" style="min-height: 150px">
      <v-progress-linear
        v-if="hasUserReadInstructions"
        class="mr-auto"
        style="width: 150px; height: 5px"
        :model-value="progress"
        rounded
      />

      <VRow class="align-start justify-center">
        <VBtn
          v-if="!hasUserReadInstructions"
          class="flex-grow-0 flex-shrink-1 d-flex"
          :append-icon="PhArrowRight"
          @click="hasUserReadInstructions = true"
          >Continue</VBtn
        >
        <VBtn
          v-else
          :disabled="!isTimerFinished"
          class="flex-grow-0 flex-shrink-1 d-flex"
          :append-icon="PhArrowRight"
          >Continue</VBtn
        >
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
    opacity 1s ease-in-out,
    max-height 0.5s ease-out;
}
</style>
