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
    <VCol class="flex-grow-0" style="position: relative">
      <div
        style="
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
        "
      >
        <div
          style="
            position: absolute;
            width: 400px;
            height: 200px;
            border-radius: 50%;
            background: #769f98;
            transform-origin: center;
            top: 0px;
            left: 50%;
            transform: translateX(-50%);
            filter: blur(125px);
          "
        />

        <div
          class="greencircle"
          style="
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: #4aecc9;
            transform-origin: bottom left;
            animation: 5000ms linear 0s infinite normal none running spin;
            animation-duration: 9000ms;
            top: 0px;
            filter: blur(110px);
          "
        />

        <div
          class="bluecircle"
          style="
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: rgb(79, 149, 255);
            transform-origin: top;
            animation: 5000ms linear 0s infinite normal none running spin;
            animation-duration: 6000ms;
            animation-direction: reverse;
            right: 20px;
            top: -100px;
            filter: blur(110px);
          "
        />

        <div
          class="purplecircle"
          style="
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: #a44acf;
            transform-origin: right;
            animation: 5000ms linear 0s infinite normal none running spin;
            animation-duration: 10000ms;
            right: -80px;
            filter: blur(110px);
          "
        />
      </div>

      <VCol style="z-index: 1">
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

        <v-btn @click="stopRecording" class="mx-auto">Stop Recording</v-btn>
      </VCol>
    </VCol>
  </BasePage>
</template>

<style>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.purplecircle::after {
  content: "";
  display: block;
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  transform-origin: center bottom;
  background: rgb(68, 206, 227);
  top: 50%;
  left: 50%;
}
.bluecircle::after {
  content: "";
  display: block;
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transform-origin: center bottom;
  background: rgb(70, 170, 152);
  top: 50%;
  left: 50%;
}
.bluecircle::before {
  content: "";
  display: block;
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  transform-origin: center bottom;
  background: rgb(242, 101, 253);
  top: 50%;
  left: auto;
  right: 50%;
}

.greencircle::before {
  content: "";
  display: block;
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transform-origin: center bottom;
  background: rgb(203, 25, 209);
  top: 50%;
  left: 50%;
}

.greencircle::after {
  content: "";
  display: block;
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  transform-origin: center bottom;
  background: rgb(53, 129, 255);
  top: 50%;
  left: auto;
  right: 100%;
}
</style>
