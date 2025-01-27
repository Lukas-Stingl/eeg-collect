<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";

import { PhArrowRight, PhX } from "@phosphor-icons/vue";

const emit = defineEmits(["close"]);

defineProps({
  modalModel: {
    type: Boolean,
    required: true,
  },
});

// ---- STATE ----

const carouselModel = ref(0);

// ---- CALLBACKS ----

const handleNextStep = () => {
  console.log("Next step");
  carouselModel.value += 1;

  if (carouselModel.value === 2) {
    carouselModel.value = 0;
  }
};

const handleClose = () => {
  emit("close");
  carouselModel.value = 0;
};
</script>

<template>
  <VCol
    v-if="modalModel"
    style="
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(32, 32, 32, 0.73);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      backdrop-filter: blur(3.5px);
      -webkit-backdrop-filter: blur(3.5px);
      z-index: 1300;
      justify-content: center;
      align-items: center;
    "
  >
    <VCard width="85vh" style="top: 50px">
      <VCarousel hide-delimiters :show-arrows="false" v-model="carouselModel">
        <VBtn
          class="rounded-circle position-absolute d-flex justify-center align-center"
          @click="handleClose"
          style="
            top: 15px;
            right: 15px;
            min-width: 0 !important;
            width: 32px;
            height: 32px;
            z-index: 10000000;
          "
        >
          <PhX size="20" />
        </VBtn>

        <VCarouselItem
          class="h-100 d-flex justify-space-between"
          style="height: 100%"
          value="0"
        >
          <VCol class="h-100 d-flex">
            <VCol class="pa-6 flex-grow-1">
              <VCardTitle class="pa-0 mb-8">
                Tip 1: Unplug electronic devices in your environment
              </VCardTitle>

              <VCol class="px-2">
                <VCol class="ga-2">
                  <v-img
                    src="@/assets/StandingDesk.png"
                    style="height: 230px"
                  ></v-img>
                  <p
                    style="
                      color: #737373;
                      text-align: justify;
                      font-weight: 500;
                      font-size: 14px;
                    "
                  >
                    Large electronic devices that require wall socket power,
                    such as <b>computers</b>, <b>monitors</b>, and
                    <b>standing desks</b>, may have poor electromagnetic
                    shielding, which can interfere with the EEG Headset. To
                    improve signal quality, pull the plug of your devices for
                    the duration of the experiment. Battery powered devices,
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
              <p style="color: #737373; font-weight: 500; font-size: 13px">
                {{ carouselModel + 1 }}/2
              </p>

              <VRow class="align-start justify-center">
                <VBtn
                  class="flex-grow-0 flex-shrink-1 d-flex"
                  :append-icon="PhArrowRight"
                  @click="handleNextStep"
                  >Next Tip</VBtn
                >
              </VRow>
            </VRow>
          </VCol>
        </VCarouselItem>

        <VCarouselItem
          class="h-100 d-flex justify-space-between"
          style="height: 100%"
          value="1"
        >
          <VCol class="h-100 d-flex">
            <VCol class="pa-6 flex-grow-1">
              <VCardTitle class="pa-0 mb-8">
                Tip 2: Wipe your ears and skin
              </VCardTitle>

              <VCol class="px-2">
                <VCol class="ga-10">
                  <v-img
                    src="@/assets/WipeEars.png"
                    style="height: 230px"
                  ></v-img>
                  <p
                    style="
                      color: #737373;
                      text-align: justify;
                      font-weight: 500;
                      font-size: 14px;
                    "
                  >
                    Wiping your skin with the disinfectant wipes significantly
                    increase the contact of the electrodes. For a higher signal
                    quality, try to put on the headphones immediately after
                    wiping your skin.
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
              <p style="color: #737373; font-weight: 500; font-size: 13px">
                {{ carouselModel + 1 }}/2
              </p>

              <VRow class="align-start justify-center">
                <VBtn
                  class="flex-grow-0 flex-shrink-1 d-flex"
                  :append-icon="PhArrowRight"
                  @click="handleNextStep"
                  >Next Tip</VBtn
                >
              </VRow>
            </VRow>
          </VCol>
        </VCarouselItem>
      </VCarousel>
    </VCard>
  </VCol>
</template>

<style scoped></style>
