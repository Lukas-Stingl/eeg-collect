import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import Recording from "@/views/StartRecording.vue";
import Participant from "@/views/StartScreen.vue";
import Check from "@/views/DeviceCheck.vue";
import SetupDevicePage from "@/views/setupDevicePage/SetupDevicePage.vue";

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
    path: "/setup-device",
    component: SetupDevicePage,
  },
  {
    path: "/recording",
    component: Recording,
    beforeRouteLeave(
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) {
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
