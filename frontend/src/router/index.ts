import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";

import Recording from "@/pages/StartRecording.vue";
import Participant from "@/pages/StartScreen.vue";
import Check from "@/pages/DeviceCheck.vue";
import SetupDevicePage from "@/pages/setupDevicePage/SetupDevicePage.vue";
import OptimizeSignalAndImpedancePage from "@/pages/optimizeSignalAndImpedancePage/OptimizeSignalAndImpedancePage.vue";
import RecordingPage from "@/pages/recordingPage/RecordingPage.vue";

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
    path: "/optimize-signal",
    component: OptimizeSignalAndImpedancePage,
  },
  {
    path: "/recording",
    component: RecordingPage,
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
