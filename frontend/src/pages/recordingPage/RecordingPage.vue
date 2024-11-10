<script setup lang="ts">
import { Chart } from "highcharts-vue";

import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";
import { computed, ComputedRef, onMounted, ref, watch } from "vue";
import { Options } from "highcharts";
import { OpenBCISerialData } from "@/utils/openBCISerialTypes";

// ---- STATE ----
useConfigureParticipantId();
useWebsocketConnection();
const { startSignalQualityCheck, stopRecording, throttledBuffer } =
  useOpenBCIUtils();

const series = ref<{ data: number; yAxis: number }[]>([]);
const data = ref();
const seriesCount = ref(8);
const pointsCount = computed(() => throttledBuffer.value.length);
const axisTop = ref(20);
const totalHeight = 500;
const yAxisHeight = computed(() => totalHeight / (seriesCount.value + 4));
const yAxis = ref<{}[]>([]);

const chartOptions: ComputedRef<Options> = computed(() => ({
  chart: {
    height: totalHeight,
    //spacing: [0, 0, 0, 0], // Remove padding
  },
  legend: { enabled: false },
  title: null,
  series: series.value,
  yAxis: yAxis.value,
}));

watch(
  () => throttledBuffer.value,
  () => {
    for (let i = 0; i < seriesCount.value; i++) {
      data.value = [];
      for (let j = 0; j < pointsCount.value; j++) {
        data.value.push(
          throttledBuffer.value[j][`A${i + 1}` as keyof OpenBCISerialData],
        );
      }
      const stream = series.value.find((stream) => stream.yAxis === i);
      if (stream) {
        stream.data = data.value;
      }
    }
  },
);

onMounted(() => {
  for (let i = 0; i < seriesCount.value; i++) {
    data.value = [];
    for (let j = 0; j < pointsCount.value; j++) {
      data.value.push(
        throttledBuffer.value[j][`A${i + 1}` as keyof OpenBCISerialData],
      );
    }
    series.value.push({
      data: data.value,
      yAxis: i,
    });
    yAxis.value.push({
      title: {
        text: `A${i + 1}`,
      },
      labels: {
        enabled: true, // Remove Y-axis labels
      },
      height: yAxisHeight.value,
      top: axisTop.value,
      offset: 0,
      lineWidth: 0, // Remove Y-axis line
      gridLineWidth: 0, // Remove grid lines
    });

    axisTop.value += yAxisHeight.value + 12.5;
  }

  startSignalQualityCheck();
});
</script>

<template>
  <BasePage heading="Recording">
    <p
      class="mb-5"
      style="
        color: #737373;
        text-align: center;
        font-weight: 500;
        font-size: 18px;
      "
    >
      Recording in progress. You can now return to the experiment Tab.<br />
    </p>

    <Chart :options="chartOptions" class="mb-8"></Chart>

    <v-btn @click="stopRecording">Stop Recording</v-btn>
  </BasePage>
</template>
<style>
.highcharts-credits {
  display: none;
}
</style>
