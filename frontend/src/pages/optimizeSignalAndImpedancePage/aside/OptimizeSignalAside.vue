<script setup lang="ts">
import { ref } from "vue";

import { PhArrowsOutSimple, PhInfo } from "@phosphor-icons/vue";
import OptimizeSignalAsideTipsModal from "@/pages/optimizeSignalAndImpedancePage/aside/components/OptimizeSignalAsideTipsModal.vue";

const isAsideTipsModalOpen = ref(false);
</script>

<template>
  <VCol>
    <VCard
      class="pa-5 rounded-xl mb-3"
      style="position: z-index: 100; width: 250px"
    >
      <VRow
        class="d-flex align-center ga-2 mb-5"
        style="margin-left: -3px !important"
      >
        <PhInfo size="24" />

        <VCardTitle class="pa-0"> Signal Quality </VCardTitle>
      </VRow>

      <VRow class="mb-4 ga-2">
        <div
          class="rounded-circle border-md"
          style="
            background: #ff4d46;
            width: 18px;
            height: 18px;
            border-color: #d1d1d1 !important;
          "
        />

        <VCardText class="pa-0"> No signal/contact </VCardText>
      </VRow>

      <VRow class="mb-4 ga-2">
        <div
          class="rounded-circle border-md"
          style="
            background: #f6a17d;
            width: 18px;
            height: 18px;
            border-color: #d1d1d1 !important;
          "
        />

        <VCardText class="pa-0"> Bad contact </VCardText>
      </VRow>

      <v-divider class="mb-4" />

      <VRow class="mb-4 ga-2">
        <div
          class="rounded-circle border-md"
          style="
            background: #a9c569;
            width: 18px;
            height: 18px;
            border-color: #eaeaea !important;
          "
        />

        <VCardText class="pa-0"> Decent signal quality </VCardText>
      </VRow>

      <VRow class="mb-4 ga-2">
        <div
          class="rounded-circle border-md"
          style="
            background: #2c6517;
            width: 18px;
            height: 18px;
            border-color: #d1d1d1 !important;
          "
        />

        <VCardText class="pa-0"> Perfect signal quality </VCardText>
      </VRow>

      <v-divider class="mb-4" />

      <VCardText
        class="pa-0 px-1"
        style="
          font-size: 13px;
          font-weight: normal;
          text-align: justify;
          text-wrap: wrap;
          color: #939393;
        "
      >
        Please ensure at least <b>decent</b> signal quality for all electrodes
        before starting the recording.
      </VCardText>
    </VCard>

    <VCard
      class="tip-button rounded-pill d-flex justify-start align-center px-5 py-2 mb-2"
      style="width: 250px; cursor: pointer"
      @click="isAsideTipsModalOpen = true"
    >
      <PhArrowsOutSimple size="30" class="mr-3" weight="bold" />

      <p
        style="
          color: #737373;
          text-align: start;
          font-weight: 500;
          font-size: 15px;
        "
      >
        Tips to improve signal quality and contact
      </p>
    </VCard>

    <OptimizeSignalAsideTipsModal
      :modal-model="isAsideTipsModalOpen"
      @close="isAsideTipsModalOpen = false"
    />
  </VCol>
</template>

<style scoped>
.tip-button {
  transition: transform 0.3s ease;
}

.tip-button:hover {
  transform: scale(1.03);
}
</style>
