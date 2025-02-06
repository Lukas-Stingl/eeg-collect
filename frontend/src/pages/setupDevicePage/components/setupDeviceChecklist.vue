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
  <v-card
    style="width: 350px; flex-grow: 0; background: white; border-radius: 8px"
    class="w-60 px-4 py-4 mb-10 rounded-xl border-sm text-start"
  >
    <v-card-title style="text-align: center">Checklist</v-card-title>
    <VCheckbox
      :model-value="props.isTurnOnHeadphonesChecked"
      @update:model-value="props.setIsTurnOnHeadphonesChecked"
      label="Turn on Headphones"
      hide-details
      :style="{
        color: props.isTurnOnHeadphonesChecked ? '#939393' : 'inherit',
      }"
    ></VCheckbox>
    <v-divider />
    <VCheckbox
      :model-value="props.isDonglePluggedInChecked"
      @update:model-value="props.setIsDonglePluggedInChecked"
      label="Plug in USB-Dongle"
      hide-details
      :style="{
        color: props.isDonglePluggedInChecked ? '#939393' : 'inherit',
      }"
    ></VCheckbox>
    <v-divider />
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
  </v-card>
</template>

<style scoped></style>
