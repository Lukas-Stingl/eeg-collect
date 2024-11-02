import { State } from "@/store/utils/storeTypes";
import { InjectionKey } from "vue";
import { Store } from "vuex";

export const injectionKey: InjectionKey<Store<State>> = Symbol();

export const STATE_DEFAULT_CONFIG: State = {
  participantId: null,
  isParticipantIdModalOpen: false,
};
