import { createRouter, createWebHistory } from "vue-router";
import Recording from "@/views/StartRecording.vue";
import Participant from "@/views/StartScreen.vue";
import Check from "@/views/DeviceCheck.vue";

const routes = [
  {
    path: "/",
    redirect: "start",
  },
  {
    path: "/start",
    component: Participant,
  },
  {
    path: "/recording",
    component: Recording,
    beforeRouteLeave(to, from, next) {
      // Logic to execute before leaving the recording route
      // For example, you can prompt the user before leaving
      const confirmLeave = window.confirm(
        "Are you sure you want to leave the recording page?",
      );
      if (confirmLeave) {
        next();
      } else {
        // If the user cancels, stay on the current route
        next(false);
      }
    },
  },
  {
    path: "/check",
    component: Check,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
