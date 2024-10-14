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
    VBtn: {
      rounded: "lg",
      color: "#00695C",
      variant: "tonal",
    },
    VBtnSecondary: {
      rounded: "lg",
      color: "secondary",
      variant: "flat",
    },
    VBtnTertiary: {
      rounded: true,
      variant: "plain",
    },
  },
});
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
