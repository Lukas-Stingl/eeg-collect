// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import CheckboxUncheckedIcon from "@/assets/CheckboxUncheckedIcon.vue";
import CheckboxCheckedIcon from "@/assets/CheckboxCheckedIcon.vue";

// Vuetify
import { createVuetify } from "vuetify";
import { VBtn } from "vuetify/components";

export default createVuetify({
  aliases: {
    VBtnSecondary: VBtn,
    VBtnTertiary: VBtn,
  },
  defaults: {
    global: {
      ripple: false,
    },
    VBtn: {
      rounded: "lg",
      color: "#00594C",
      variant: "tonal",
      style: [{ textTransform: "none", minWidth: "100px" }],
    },
    VBtnSecondary: {
      rounded: "lg",
      color: "secondary",
      variant: "flat",
      style: [{ textTransform: "none" }],
    },
    VBtnTertiary: {
      rounded: true,
      variant: "plain",
      style: [{ textTransform: "none" }],
    },
    VRow: { style: [{ display: "flex" }] },
    VCol: { style: [{ display: "flex", flexDirection: "column" }] },
    VCheckbox: {
      class: "shrink mr-0 mt-0",
      density: "comfortable",
      style: [{ fontWeight: "500" }],
      falseIcon: CheckboxUncheckedIcon,
      trueIcon: CheckboxCheckedIcon,
    },
  },
});
