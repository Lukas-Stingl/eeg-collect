import { InjectionKey } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";

import { State } from "@/store/utils/storeTypes";
import { injectionKey, STATE_DEFAULT_CONFIG } from "@/store/utils/storeHelpers";

const store = createStore<State>({
  state: STATE_DEFAULT_CONFIG,
  mutations: {
    setParticipantId(state, payload: { participantId: string }) {
      state.participantId = payload.participantId;
    },
    setParticipantIdModalOpen(state) {
      state.isParticipantIdModalOpen = true;
    },
    setParticipantIdModalClose(state) {
      state.isParticipantIdModalOpen = false;
    },
  },
});

export default store;

export const useStore = () => baseUseStore(injectionKey);
