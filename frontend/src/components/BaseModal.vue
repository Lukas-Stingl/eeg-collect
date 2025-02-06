<script setup lang="ts">
import {
  defineProps,
  defineEmits,
  PropType,
  CSSProperties,
  watch,
  ref,
} from "vue";

const props = defineProps({
  title: String,
  content: String,
  model: Boolean,
  persistent: Boolean,
  titleStyle: {
    type: Object as PropType<CSSProperties>,
    required: false,
  },
});

const localModel = ref(props.model);

const emit = defineEmits(["update:model"]);

watch(
  () => props.model,
  (newValue) => {
    console.log("props.model changed", newValue);
    localModel.value = newValue;
  },
  { immediate: true },
);

watch(
  () => localModel.value,
  (newValue) => {
    if (newValue !== props.model) {
      emit("update:model", newValue);
    }
  },
);
</script>

<template>
  <VDialog
    v-model="localModel"
    :persistent="props.persistent"
    style="
      display: flex;
      flex-direction: column;
      width: auto;
      font-family:
        ui-sans-serif,
        system-ui,
        Open Sans,
        Arial,
        sans-serif;
    "
  >
    <VCol
      style="
        display: flex;
        flex-direction: column;
        width: auto;
        margin: auto;
        min-width: 400px;
        background-color: white;
        border-radius: 12px;
        padding: 28px;
        gap: 16px;
      "
    >
      <slot name="header" />

      <VCol style="display: flex; gap: 12px; padding: 0">
        <h3 :style="props.titleStyle">{{ props.title }}</h3>
        <slot />
      </VCol>
    </VCol>
  </VDialog>
</template>
