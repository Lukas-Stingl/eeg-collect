<script setup lang="ts">
import { computed, ComputedRef, onMounted, Ref, ref, watch } from "vue";

import BasePage from "@/components/BasePage.vue";
import {
  useConfigureParticipantId,
  useOpenBCIUtils,
  useWebsocketConnection,
} from "@/utils/hooks";
import * as d3 from "d3";
import { NODES } from "@/utils/types";
import { BaseType } from "d3";
import {
  Node,
  Node2,
  NODES_DEFAULT_VALUES,
} from "@/pages/optimizeSignalAndImpedancePage/utils/optimizeSignalAndImpedanceTypes";
import { getSignalState } from "@/pages/optimizeSignalAndImpedancePage/utils/helpers";
import { useRoute, useRouter } from "vue-router";

// ---- STATE ----

useConfigureParticipantId();
useWebsocketConnection();

const { startSignalQualityCheck, stopRecording, signalRMS } = useOpenBCIUtils();
const router = useRouter();
const route = useRoute();
const preventUnloadWarningDialog = ref(false);

const reactiveSignalRMS = ref(signalRMS.value);

const baseModel = ref(null);
const svg: Ref<d3.Selection<
  SVGImageElement,
  unknown,
  HTMLElement,
  any
> | null> = ref(null);
const tooltip: Ref<d3.Selection<BaseType, unknown, HTMLElement, any> | null> =
  ref(null);
const circles: Ref<d3.Selection<
  SVGCircleElement,
  { id: string; x: number; y: number; r: number },
  SVGImageElement,
  unknown
> | null> = ref(null);

const nodeData: ComputedRef<Node[]> = computed(() => {
  //const a = reactiveSignalRMS.value;

  if (!reactiveSignalRMS.value) {
    return NODES_DEFAULT_VALUES;
  }

  // Wir betrachten von signalRMS nur A1 bis A8

  const nodes: Node[] = [];

  for (const key in reactiveSignalRMS.value) {
    switch (key) {
      case "A1":
        nodes.push({
          node_id: "L5",
          state: getSignalState({ signal: reactiveSignalRMS.value.A1 ?? 0 }),
          impedance: reactiveSignalRMS.value.A1 ?? 0,
        });
        break;
      case "A2":
        nodes.push({
          node_id: "L3",
          state: getSignalState({ signal: reactiveSignalRMS.value.A2 ?? 0 }),
          impedance: reactiveSignalRMS.value.A2 ?? 0,
        });
        break;
      case "A3":
        nodes.push({
          node_id: "C3",
          state: getSignalState({ signal: reactiveSignalRMS.value.A3 ?? 0 }),
          impedance: reactiveSignalRMS.value.A3 ?? 0,
        });
        break;
      case "A4":
        nodes.push({
          node_id: "Cz",
          state: getSignalState({ signal: reactiveSignalRMS.value.A4 ?? 0 }),
          impedance: signalRMS.value.A4 ?? 0,
        });
        break;
      case "A5":
        nodes.push({
          node_id: "C4",
          state: getSignalState({ signal: reactiveSignalRMS.value.A5 ?? 0 }),
          impedance: reactiveSignalRMS.value.A5 ?? 0,
        });
        break;
      case "A6":
        nodes.push({
          node_id: "R3",
          state: getSignalState({ signal: reactiveSignalRMS.value.A6 ?? 0 }),
          impedance: reactiveSignalRMS.value.A6 ?? 0,
        });
        break;
      case "A7":
        nodes.push({
          node_id: "R4",
          state: getSignalState({ signal: reactiveSignalRMS.value.A7 ?? 0 }),
          impedance: reactiveSignalRMS.value.A7 ?? 0,
        });
        break;
      case "A8":
        nodes.push({
          node_id: "R5",
          state: getSignalState({ signal: reactiveSignalRMS.value.A8 ?? 0 }),
          impedance: reactiveSignalRMS.value.A8 ?? 0,
        });
        break;
    }
  }

  return nodes;
});

watch(
  () => signalRMS.value,
  (newValue) => {
    console.log("signalRMS changed to");
    reactiveSignalRMS.value = newValue;
  },
);

watch(
  () => nodeData.value,
  () => updateCircles(),
);

// ---- LIFECYCLE HOOKS ----

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);

  initializeD3();

  // Start the signal quality check in the background
  startSignalQualityCheck();

  // ---- DEBUG ----

  // console.log("Continue Mounted");
  // setTimeout(() => {
  //   console.log("JNON");
  //   stopRecording();
  // }, 15000);
});

// ---- METHODS ----

const initializeD3 = () => {
  console.log("Initializing D3");
  svg.value = d3
    .select(baseModel.value)
    .append("image")
    .attr("xlink:href", require("@/assets/baseModel.png"))
    .attr("width", 1000)
    .attr("height", 500);
  tooltip.value = d3.select(".tooltip");

  svg.value = d3.select(baseModel.value);

  if (!svg.value) {
    return;
  }

  circles.value = svg.value
    .selectAll("circle")
    .data(NODES)
    .enter()
    .append("circle")
    .attr("id", (d: Node2) => `node-${d.id}`)
    .attr("cx", (d: Node2) => d.x)
    .attr("cy", (d: Node2) => d.y)
    .attr("r", (d: Node2) => d.r)
    .attr("class", "node");

  updateCircles();
};

const updateCircles = () => {
  if (!baseModel.value) {
    return;
  }

  svg.value = d3.select(baseModel.value);

  if (svg.value === null) {
    return;
  }

  svg.value
    .selectAll("circle")
    .data(nodeData.value, (d: any) => d.node_id)
    .join(
      (enter: any) =>
        enter
          .append("circle")
          .attr("class", (d: Node) => `node ${stateToClass(d.state)}`)
          .attr(
            "cx",
            (d: Node) => NODES.find((n) => n.id === d.node_id)?.x || 0,
          )
          .attr(
            "cy",
            (d: Node) => NODES.find((n) => n.id === d.node_id)?.y || 0,
          )
          .attr("r", 12)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut),
      (update: any) =>
        update.attr("class", (d: any) => `node ${stateToClass(d.state)}`),
    );
};

const handleMouseOut = (event: MouseEvent) => {
  if (!tooltip.value || !svg.value) {
    return;
  }

  tooltip.value.style("opacity", 0);
  d3.select(event.target as SVGCircleElement).attr("r", 12); // Reset radius

  // Remove desaturation from all circles
  svg.value.selectAll("circle").classed("desaturated", false);
};

const handleMouseOver = (event: MouseEvent, d: Node) => {
  if (!tooltip.value || !svg.value) {
    return;
  }
  console.log(d);

  tooltip.value
    .style("opacity", 1)
    .html(
      `Node ID: ${d.node_id}<br/>State: ${stateToClass(
        d.state,
      )}<br/>Rail: ${d.impedance}`,
    )
    .style("left", `${event.offsetX + 5}px`)
    .style("top", `${event.offsetY + 10}px`);

  // Select the current circle element using D3's event handling
  d3.select(event.target as SVGCircleElement).attr("r", 14); // Enlarge on hover

  // Desaturate other circles
  svg.value
    .selectAll("circle")
    .filter((node: any) => node.node_id !== d.node_id)
    .classed("desaturated", true);
};

// TODO - Move to utils; Make Array Constant
const stateToClass = (state: number) => {
  const stateClasses = ["off", "bad", "moderate", "good"];
  return stateClasses[state] || "unknown";
};

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  const confirmationMessage =
    "Are you sure you want to leave? Changes you made may not be saved.";

  console.log(preventUnloadWarningDialog.value);
  event.returnValue = confirmationMessage; // Standard for most browsers
  if (!preventUnloadWarningDialog.value) {
    event.returnValue = confirmationMessage; // Standard for most browsers
  }
  return confirmationMessage; // For some browsers
};
const handleRedirectToFinish = (event: BeforeUnloadEvent) => {
  console.log("AAAAAAAA");
  setTimeout(() => {}, 15000);
  event.returnValue = "SSS";
  preventUnloadWarningDialog.value = true;
  router.push({ path: "/recording", query: route.query });
};
</script>

<template>
  <BasePage heading="Adjust Position">
    <p
      style="
        color: #737373;
        text-align: center;
        font-weight: 500;
        font-size: 18px;
      "
    >
      Please adjust the headset until most of the electrodes <br />have a good
      connection, as indicated by the color in the picture.
    </p>

    <div class="headphones" style="max-height: 430px; align-items: center">
      <!-- Device Check Content -->

      <svg
        ref="baseModel"
        width="1000"
        height="500"
        style="position: relative; right: -11px"
      ></svg>
      <div class="tooltip"></div>
    </div>

    <VRow style="gap: 16px; max-height: 60px">
      <v-btn @click="stopRecording">Stop recording</v-btn>
      <v-btn v-on:click="handleRedirectToFinish">Start Recording</v-btn>
    </VRow>

    <VRow v-if="false">
      <div v-for="(rms, index) in signalRMS" :key="index">
        <p>{{ index }}: {{ rms }}</p>
      </div>
    </VRow>

    <p
      style="
        font-size: 13px;
        color: #939393;
        text-align: center;
        max-width: 600px;
      "
    >
      An impedance check of the electrodes will be performed. This may take a
      minute. <br />Afterwards, the recording is started and you can start with
      your task.
    </p>
  </BasePage>
</template>
