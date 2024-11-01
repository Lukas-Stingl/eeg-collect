import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      participantNumber: "", // Example state property
      baseModel: "",
    };
  },
  mutations: {
    setParticipantNumber(state, number) {
      state.participantNumber = number;
    },
    setBaseModel(state, model) {
      state.baseModel = model;
    },
    actions: {
      // actions to perform async operations...
    },
    getters: {
      // getters to retrieve state data...
    },
  },
});

export default store;
