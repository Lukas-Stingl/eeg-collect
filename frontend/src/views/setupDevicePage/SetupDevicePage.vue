<script setup lang="ts">
import { computed, ref } from "vue";

import BasePage from "@/components/BasePage.vue";
import SetupDeviceChecklist from "@/views/setupDevicePage/components/setupDeviceChecklist.vue";

// ---- STATE ----

const isChecklistTurnOnHeadphonesChecked = ref(false);
const isChecklistConnectHeadphonesViaBluetoothChecked = ref(false);
const isChecklistDonglePluggedInChecked = ref(false);

// ---- SETTER FUNCTIONS ----
const setIsChecklistTurnOnHeadphonesChecked = (value: boolean) => {
  isChecklistTurnOnHeadphonesChecked.value = value;
};

const setIsChecklistConnectHeadphonesViaBluetoothChecked = (value: boolean) => {
  isChecklistConnectHeadphonesViaBluetoothChecked.value = value;
};

const setIsChecklistDonglePluggedInChecked = (value: boolean) => {
  isChecklistDonglePluggedInChecked.value = value;
};

const isChecklistCompleted = computed(
  () =>
    isChecklistTurnOnHeadphonesChecked.value &&
    isChecklistConnectHeadphonesViaBluetoothChecked.value &&
    isChecklistDonglePluggedInChecked.value,
);
</script>

<template>
  <BasePage heading="Setup Device">
    <p
      class="mb-8"
      style="
        color: #737373;
        text-align: center;
        font-weight: 500;
        font-size: 18px;
      "
    >
      We will now connect the EEG-Headset and check the signal quality. <br />
      If you are ready, turn on your Headphones and plug in your USB Receiver.
    </p>

    <SetupDeviceChecklist
      :isTurnOnHeadphonesChecked="isChecklistTurnOnHeadphonesChecked"
      :isDonglePluggedInChecked="isChecklistDonglePluggedInChecked"
      :isConnectHeadphonesViaBluetoothChecked="
        isChecklistConnectHeadphonesViaBluetoothChecked
      "
      :setIsTurnOnHeadphonesChecked="setIsChecklistTurnOnHeadphonesChecked"
      :setIsDonglePluggedInChecked="setIsChecklistDonglePluggedInChecked"
      :setIsConnectHeadphonesViaBluetoothChecked="
        setIsChecklistConnectHeadphonesViaBluetoothChecked
      "
    />

    <VBtn :disabled="!isChecklistCompleted" class="mb-3">
      Connect Headphones
    </VBtn>
    <p
      style="
        font-size: 13px;
        color: #939393;
        text-align: center;
        max-width: 600px;
      "
    >
      Clicking the Button will prompt a browser pop-up, asking you to select
      which serial port to open. <br />
      Select the option starting with either "FT231X USB" or "COM3".
    </p>
  </BasePage>
</template>

<style scoped></style>
