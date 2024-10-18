// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

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
  },
});
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
