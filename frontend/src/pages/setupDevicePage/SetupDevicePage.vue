<script setup lang="ts">
import { computed, Ref, ref } from "vue";

import BasePage from "@/components/BasePage.vue";
import SetupDeviceChecklist from "@/pages/setupDevicePage/components/setupDeviceChecklist.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";
import { ConnectedDeviceStatus } from "@/utils/openBCISerialTypes";
import { PhWarningCircle } from "@phosphor-icons/vue";
import { useRoute, useRouter } from "vue-router";

// ---- STATE ----

useConfigureParticipantId();
useWebsocketConnection();
const { setupSerialConnection } = useOpenBCIUtils();
const router = useRouter();
const route = useRoute();

const isChecklistTurnOnHeadphonesChecked = ref(false);
const isChecklistConnectHeadphonesViaBluetoothChecked = ref(false);
const isChecklistDonglePluggedInChecked = ref(false);
const isCytonConnectionLoadingIndicatorShown = ref(false);
const isHeadSetConnected: Ref<boolean | ConnectedDeviceStatus> = ref(false);
const connectionErrorModal = ref({
  isModalOpen: false,
  title: "",
  message: "",
});

// ---- METHODS ----

const handleConnectSerialPort = async () => {
  isHeadSetConnected.value = await setupSerialConnection({
    setIsLoadingModalShown: (status: boolean) => {
      isCytonConnectionLoadingIndicatorShown.value = status;
    },
  });

  switch (isHeadSetConnected.value) {
    case ConnectedDeviceStatus.SUCCESS:
      connectionErrorModal.value = {
        isModalOpen: false,
        title: "",
        message: "",
      };

      handleRedirectToRecording();
      break;
    case ConnectedDeviceStatus.NO_DATA_STREAMED:
      connectionErrorModal.value = {
        isModalOpen: true,
        title: "Wrong Port Selected",
        message:
          'No datastream detected. Please make sure to select the correct serial port in the browser pop up menu ("FT231X..." or "COM3").',
      };
      break;
    case ConnectedDeviceStatus.DONGLE_CONNECTED_BUT_HEADSET_NOT_FOUND:
      connectionErrorModal.value = {
        isModalOpen: true,
        title: "Headset not found",
        message:
          "Please make sure that the headset battery is charged and the headset is turned on.",
      };
      break;
    case false:
      connectionErrorModal.value = {
        isModalOpen: true,
        title: "Something went wrong.",
        message: "Please try again.",
      };
      break;
  }
};

const handleRetryHeadsetConnection = () => {
  connectionErrorModal.value.isModalOpen = false;
  handleConnectSerialPort();
};
const setIsChecklistTurnOnHeadphonesChecked = (value: boolean) => {
  isChecklistTurnOnHeadphonesChecked.value = value;
};

const setIsChecklistConnectHeadphonesViaBluetoothChecked = (value: boolean) => {
  isChecklistConnectHeadphonesViaBluetoothChecked.value = value;
};

const setIsChecklistDonglePluggedInChecked = (value: boolean) => {
  isChecklistDonglePluggedInChecked.value = value;
};

const handleRedirectToRecording = () =>
  router.push({ path: "/optimize-signal", query: route.query });

// ---- COMPUTED ----

const isChecklistCompleted = computed(
  () =>
    isChecklistTurnOnHeadphonesChecked.value &&
    isChecklistConnectHeadphonesViaBluetoothChecked.value &&
    isChecklistDonglePluggedInChecked.value,
);
</script>

<template>
  <BasePage heading="Setup EEG Device">
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

    <VBtn
      :disabled="!isChecklistCompleted"
      class="mb-3"
      @click="handleConnectSerialPort"
    >
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

  <v-dialog
    v-model="isCytonConnectionLoadingIndicatorShown"
    max-width="500px"
    persistent
  >
    <v-card style="padding: 40px; border-radius: 12px; align-items: center">
      <v-progress-circular
        indeterminate
        :size="41"
        :width="5"
        color="#00594C"
        style="margin-bottom: 8px"
      ></v-progress-circular>

      <v-card-text style="padding-bottom: 0">
        Connecting Headset...
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Error Modal -->
  <v-dialog v-model="connectionErrorModal.isModalOpen" max-width="500px">
    <v-card style="padding: 16px; border-radius: 12px">
      <div style="display: flex; flex-direction: row; align-items: center">
        <PhWarningCircle :size="28" color="red" />

        <v-card-title style="text-align: left">
          {{ connectionErrorModal.title }}
        </v-card-title>
      </div>

      <v-card-text style="text-align: left">
        {{ connectionErrorModal.message }}
      </v-card-text>
      <v-card-actions style="justify-content: end">
        <v-btn
          @click="() => (connectionErrorModal.isModalOpen = false)"
          rounded="lg"
          >Close</v-btn
        >
        <VBtn @click="handleRetryHeadsetConnection" rounded="lg" variant="tonal"
          >Retry</VBtn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
