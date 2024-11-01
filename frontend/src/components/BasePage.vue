<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import { LottieAnimation } from "lottie-web-vue";

import Dino from "@/assets/Dino.json";

const props = defineProps({
  heading: {
    type: String,
    required: true,
  },
});

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
    class="h-100 w-100 justify-center align-center pa-0"
    style="background: #fafafc"
  >
    <VCol class="w-50 justify-center align-center pa-0">
      <LottieAnimation
        style="
          width: 150px;
          justify-content: center;
          align-items: center;
          margin-left: auto;
          margin-right: auto;
        "
        ref="anim"
        :animation-data="Dino"
        :loop="true"
        :auto-play="true"
        :speed="1"
      />
      <h1 class="mb-5" style="font-size: 38px">{{ props.heading }}</h1>
      <slot />
    </VCol>
  </VCol>
</template>

<style scoped></style>
