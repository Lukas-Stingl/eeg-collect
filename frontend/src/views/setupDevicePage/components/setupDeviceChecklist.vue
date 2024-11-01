<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  isTurnOnHeadphonesChecked: {
    type: Boolean,
    required: true,
  },
  isDonglePluggedInChecked: {
    type: Boolean,
    required: true,
  },
  isConnectHeadphonesViaBluetoothChecked: {
    type: Boolean,
    required: true,
  },
  setIsTurnOnHeadphonesChecked: {
    type: Function,
    required: true,
  },
  setIsDonglePluggedInChecked: {
    type: Function,
    required: true,
  },
  setIsConnectHeadphonesViaBluetoothChecked: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <VCol
    style="
      width: 350px;
      flex-grow: 0;
      background: white;
      border-radius: 8px;
      border: 1px solid #d2dbe4;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    "
    class="px-6 py-6 mb-10"
  >
    <h2 class="mb-1" style="font-size: 18px; font-weight: bolder">Checklist</h2>
    <VCheckbox
      :model-value="props.isTurnOnHeadphonesChecked"
      @update:model-value="props.setIsTurnOnHeadphonesChecked"
      label="Turn on Headphones"
      hide-details
      :style="{
        color: props.isTurnOnHeadphonesChecked ? '#939393' : 'inherit',
      }"
    ></VCheckbox>
    <VCheckbox
      :model-value="props.isDonglePluggedInChecked"
      @update:model-value="props.setIsDonglePluggedInChecked"
      label="Plug in USB-Dongle"
      hide-details
      :style="{
        color: props.isDonglePluggedInChecked ? '#939393' : 'inherit',
      }"
    ></VCheckbox>
    <VCheckbox
      :model-value="props.isConnectHeadphonesViaBluetoothChecked"
      @update:model-value="props.setIsConnectHeadphonesViaBluetoothChecked"
      label="Connect Headphones via Bluetooth to your Computer"
      hide-details
      :style="{
        color: props.isConnectHeadphonesViaBluetoothChecked
          ? '#939393'
          : 'inherit',
      }"
    ></VCheckbox>
  </VCol>
</template>

<style scoped></style>
