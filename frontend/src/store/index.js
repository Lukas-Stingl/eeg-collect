import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      participantNumber: "", // Example state property
      // other state properties...
    };
  },
  mutations: {
    setParticipantNumber(state, number) {
      state.participantNumber = number;
    }
  },
  actions: {
    // actions to perform async operations...
  },
  getters: {
    // getters to retrieve state data...
  }
});

export default store;
