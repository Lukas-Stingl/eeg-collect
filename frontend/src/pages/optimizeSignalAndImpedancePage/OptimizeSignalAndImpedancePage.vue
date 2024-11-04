<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useWebsocketConnection,
} from "@/utils/hooks";

// ---- STATE ----
useConfigureParticipantId();
const ws = useWebsocketConnection();
</script>

<template>
  <BasePage heading="Optimize Headphones Position">Hallo</BasePage>
</template>
