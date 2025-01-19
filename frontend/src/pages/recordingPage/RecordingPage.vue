<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";

// ---- STATE ----
useConfigureParticipantId();
useWebsocketConnection();
const { startRecording, stopRecording, runImpedanceCheck } = useOpenBCIUtils();

const router = useRouter();
const route = useRoute();

// ---- CALLBACKS ----

const handleStopRecording = async () => {
  stopRecording();

  await runImpedanceCheck().then(() =>
    router.push({ path: "/finish", query: route.query }),
  );
};

// ---- LIFECYCLE HOOKS ----

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
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 150px;
        "
      >
        <div
          style="
            position: absolute;
            width: 500px;
            height: 200px;
            border-radius: 50%;
            background: #83b6dd;
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
            background: #14bfb2;
            transform-origin: bottom left;
            animation: 5000ms linear 0s infinite normal none running spin;
            animation-duration: 9000ms;
            top: -100px;
            filter: blur(100px);
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
            top: 0px;
            filter: blur(100px);
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
            animation-duration: 6000ms;
            right: -80px;
            filter: blur(100px);
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

        <v-btn @click="handleStopRecording" class="mx-auto"
          >Stop Recording</v-btn
        >
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

.purplecircle::before {
  content: "";
  display: block;
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  transform-origin: center bottom;
  background: rgb(109, 157, 239);
  top: 70%;
  left: auto;
  right: 50%;
}
.purplecircle::after {
  content: "";
  display: block;
  position: absolute;
  width: 130px;
  height: 130px;
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
  background: rgb(242, 80, 246);
  top: -30%;
  left: -50%;
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
