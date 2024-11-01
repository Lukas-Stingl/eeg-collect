<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  heading: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <VCol
    class="h-100 w-100 justify-center align-center pa-0"
    style="background: #fafafc"
  >
    <VCol class="w-50 justify-center align-center pa-0">
      <h1 class="mb-5" style="font-size: 38px">{{ props.heading }}</h1>
      <slot />
    </VCol>
  </VCol>
</template>

<style scoped></style>
