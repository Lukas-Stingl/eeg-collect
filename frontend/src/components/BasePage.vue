<script setup lang="ts">
import { defineProps, onMounted, ref, watch } from "vue";
import { LottieAnimation } from "lottie-web-vue";

import Dino from "@/assets/Dino.json";
import BluetoothHeadphones from "@/assets/BluetoothHeadphones.json";
import { useRoute } from "vue-router";

const props = defineProps({
  heading: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const path = ref(route.path);

watch(
  () => route.path,
  (newPath) => {
    path.value = newPath;
  },
);

// ---- LOTTIE ----
let anim = ref();
// eslint-disable-next-line no-undef
onMounted(() => {
  setTimeout(() => {
    console.log(anim.value.goToAndPlay(150, true));
    anim.value;
  }, 500);
});
</script>

<template>
  <VCol
    class="w-100 justify-center align-center pa-8 overflow-hidden"
    style="background: #fafafc; overflow: auto; flex-grow: 10"
  >
    <VCol class="w-50 justify-center align-center pa-0">
      <div
        :class="path !== '/recording' ? 'lottie-container' : ''"
        style="z-index: 10"
      >
        <LottieAnimation
          style="
            width: 150px;
            justify-content: center;
            align-items: center;
            margin-left: auto;
            margin-right: auto;
          "
          ref="anim"
          :animation-data="path === '/recording' ? Dino : BluetoothHeadphones"
          :loop="true"
          :auto-play="true"
          :speed="1"
        />
      </div>
      <h1 class="mb-5" style="font-size: 38px; z-index: 10">
        {{ props.heading }}
      </h1>
      <slot />
    </VCol>
  </VCol>
</template>

<style scoped>
.lottie-container {
  width: 150px;
  height: 100px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lottie-container > * {
  transform: scale(1.5); /* Adjust the scale as needed */
}
</style>
