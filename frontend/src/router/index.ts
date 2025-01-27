import {
  createRouter,
  createWebHistory,
  LocationQuery,
  NavigationGuardNext,
  RouteLocationNormalized,
  useRoute,
} from "vue-router";

import SetupDevicePage from "@/pages/setupDevicePage/SetupDevicePage.vue";
import OptimizeSignalAndImpedancePage from "@/pages/optimizeSignalAndImpedancePage/OptimizeSignalAndImpedancePage.vue";
import RecordingPage from "@/pages/recordingPage/RecordingPage.vue";
import FinishPage from "@/pages/FinishPage.vue";
import { ROUTES } from "@/utils/routes";

let validNavigation = false;

const routes = [
  {
    path: "/",
    redirect: "start",
  },
  {
    path: "/setup-device",
    component: SetupDevicePage,
  },
  {
    path: "/optimize-signal",
    component: OptimizeSignalAndImpedancePage,
    meta: { requiresRef: true },
  },
  {
    path: "/recording",
    component: RecordingPage,
    meta: { requiresRef: true },
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
    path: "/finish",
    component: FinishPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresRef && !validNavigation) {
    next({ path: ROUTES.SETUP_DEVICE, query: to.query });

    return;
  }

  // Allow Access
  validNavigation = false;
  next();
});

export const navigateToRestricted = (path: string, query?: LocationQuery) => {
  validNavigation = true;
  router.push({ path: path, query: query });
};

export default router;
