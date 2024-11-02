<script setup lang="ts">
import { computed, ref } from "vue";

import BaseModal from "@/components/BaseModal.vue";
import { PhWarningCircle } from "@phosphor-icons/vue";
import { useStore } from "@/store";

// ---- STATE ----

const participantId = ref("");
const store = useStore();
const isParticipantIdModalOpen = computed(
  () => store.state.isParticipantIdModalOpen,
);

// ---- CALLBACKS ----

const handleSubmitParticipantId = () => {
  if (participantId.value) {
    store.commit("setParticipantId", { participantId: participantId.value });
    store.commit("setParticipantIdModalClose");
  }
};
</script>

<template>
  <BaseModal
    title="Missing  Participant ID"
    persistent
    :titleStyle="{ alignSelf: 'center' }"
    :model="isParticipantIdModalOpen"
  >
    <template #header>
      <VRow style="justify-content: center; align-items: center; height: 80px">
        <PhWarningCircle color="red" size="50px" />
      </VRow>
    </template>

    <VCol
      class="pa-0"
      style="
        display: flex;
        flex-direction: column;
        max-width: 400px;
        color: #737373;
      "
    >
      The participant ID could not be found in the URL. Please ask your
      supervisor for instructions. If you were given it verbally, please enter
      it manually.

      <VTextField
        v-model="participantId"
        label="Participant ID"
        dense
        variant="solo"
        rounded="lg"
        style="margin-top: 16px"
        hide-details
        density="comfortable"
        flat
        bg-color="#edf2fa"
      />

      <VBtn
        @click="handleSubmitParticipantId"
        color="red"
        style="align-self: flex-end; margin-top: 16px"
        :disabled="!participantId"
      >
        Submit
      </VBtn>
    </VCol>
  </BaseModal>
</template>

<style scoped></style>
