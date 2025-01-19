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
      variant: "flat",
      style: [
        {
          textTransform: "none",
          minWidth: "100px",
          backgroundColor: "rgba(255,255,255,0.3)",
          borderColor: "rgba(124,127,122,0.4) !important",
        },
      ],
      class: "flex-grow-0 border-sm",
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
    VCol: {
      style: [{ display: "flex", flexDirection: "column" }],
      class: "pa-0",
    },
    VCheckbox: {
      class: "shrink mr-0 mt-0",
      density: "comfortable",
      style: [{ fontWeight: "500" }],
      falseIcon: CheckboxUncheckedIcon,
      trueIcon: CheckboxCheckedIcon,
    },
    VCard: {
      rounded: "lg",
      border: "sm",
      elevation: 0,
    },
    VCardTitle: {
      style: [{ fontSize: "1.3rem", fontWeight: "600", textAlign: "start" }],
    },
    VCardText: {
      style: [{ textAlign: "start" }],
    },
  },
});
