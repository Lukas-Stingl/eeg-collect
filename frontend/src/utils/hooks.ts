import { useStore } from "@/store";
import { useRoute } from "vue-router";

import { URL_PARAMS } from "@/utils/helpers";
import { computed, ref, watch } from "vue";

export const useConfigureParticipantId = () => {
  const store = useStore();
  const UrlRoute = useRoute();

  const participantId = computed(
    () => UrlRoute.query[URL_PARAMS.participantIdParam],
  );

  if (store.state.participantId) {
    return;
  }

  watch(
    () => participantId.value,
    () => {
      participantId.value
        ? store.commit("setParticipantId", {
            participantId: `${participantId.value}`,
          })
        : store.commit("setParticipantIdModalOpen");
    },
    { immediate: true },
  );
};
