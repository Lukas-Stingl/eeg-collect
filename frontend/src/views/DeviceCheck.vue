<template>
  <div>
    <h2>Device Check</h2>

    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6" class="image-container">
          <v-img
            :src="require('@/assets/headphones.png')"
            class="my-3"
            contain
            max-height="400"
            max-width="648"
          />


<v-icon v-if="showIcon1" class="v-icon-1" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon2" class="v-icon-2" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon3" class="v-icon-3" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon4" class="v-icon-4" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon5" class="v-icon-5" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon6" class="v-icon-6" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon7" class="v-icon-7" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon8" class="v-icon-8" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon9" class="v-icon-9" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon10" class="v-icon-10" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon11" class="v-icon-11" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon12" class="v-icon-12" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon13" class="v-icon-13" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon14" class="v-icon-14" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon15" class="v-icon-15" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon16" class="v-icon-16" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon17" class="v-icon-17" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon18" class="v-icon-18" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon19" class="v-icon-19" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon20" class="v-icon-20" color="red" size="15">mdi-alert-outline</v-icon>
          <v-icon v-if="showIcon21" class="v-icon-21" color="red" size="15">mdi-alert-outline</v-icon>
        </v-col>
        
      </v-row>
    </v-container>
  </div>

<div class="help-class">
              <v-icon class="help" color="info" icon="mdi-help-circle-outline" size="x-small" @click="toggleHelp" style="z-index: 9999999;"></v-icon>

</div>
<div class="continue">
<v-btn @click="redirectToStartRecording">Weiter</v-btn>
</div>

              <v-dialog v-model="isHelpOpen" max-width="500px">
            <v-card>
              <v-card-title>Hilfe</v-card-title>
              <v-card-text>
                Falls einzelne Kanäle ein Fehlersymbol anzeigen, schalten Sie das Gerät bitte aus und wieder ein und achten Sie darauf, dass die Elektrotroden korrekt angebracht sind.
              </v-card-text>
              <v-card-actions>
                <v-btn @click="toggleHelp">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

</template>

<script>
export default {
  name: 'DeviceCheck',
  data() {
    return {
        isHelpOpen: false,
      // Randomly decide whether to show each icon
      showIcon1: Math.random() < 0.5,
      showIcon2: Math.random() < 0.5,
      showIcon3: Math.random() < 0.5,
      showIcon4: Math.random() < 0.5,
      showIcon5: Math.random() < 0.5,
      showIcon6: Math.random() < 0.5,
      showIcon7: Math.random() < 0.5,
      showIcon8: Math.random() < 0.5,
      showIcon9: Math.random() < 0.5,
      showIcon10: Math.random() < 0.5,
      showIcon11: Math.random() < 0.5,
      showIcon12: Math.random() < 0.5,
      showIcon13: Math.random() < 0.5,
      showIcon14: Math.random() < 0.5,
      showIcon15: Math.random() < 0.5,
      showIcon16: Math.random() < 0.5,
      showIcon17: Math.random() < 0.5,
      showIcon18: Math.random() < 0.5,
      showIcon19: Math.random() < 0.5,
      showIcon20: Math.random() < 0.5,
      showIcon21: Math.random() < 0.5,
    };
  },
  methods: {
    toggleHelp() {
      this.isHelpOpen = !this.isHelpOpen;
    },
    redirectToStartRecording() {
      // Redirect to the /check route
      this.$router.push('/recording');
      this.toggleHelp();
    },
  }
};
</script>

<style scoped>
/* Add your styles specific to this component if needed */
h2 {
  text-align: center;
}

.image-container {
  position: relative;
}

/* Center the icons relative to the image dimensions */
.v-icon-1 {
  position: absolute;
  top: 62%;
  left: 23%;
  transform: translate(-50%, -50%);
}

.v-icon-2 {
  position: absolute;
  top: 74%;
  left: 23%;
  transform: translate(-50%, -50%);
}

.v-icon-3 {
  position: absolute;
  top: 82.5%;
  left: 28%;
  transform: translate(-50%, -50%);
}

.v-icon-4 {
  position: absolute;
  top: 82.5%;
  left: 37.2%;
  transform: translate(-50%, -50%);
}

.v-icon-5 {
  position: absolute;
  top: 74%;
  left: 42.2%;
  transform: translate(-50%, -50%);
}

.v-icon-6 {
  position: absolute;
  top: 62%;
  left: 42.2%;
  transform: translate(-50%, -50%);
}

.v-icon-7 {
  position: absolute;
  top: 53%;
  left: 37.2%;
  transform: translate(-50%, -50%);
}

.v-icon-8 {
  position: absolute;
  top: 52.8%;
  left: 28%;
  transform: translate(-50%, -50%);
}

.v-icon-9 {
  position: absolute;
  top: 62%;
  left: 58%;
  transform: translate(-50%, -50%);
}

.v-icon-10 {
  position: absolute;
  top: 74%;
  left: 57.9%;
  transform: translate(-50%, -50%);
}

.v-icon-11 {
  position: absolute;
  top: 82.5%;
  left: 62.9%;
  transform: translate(-50%, -50%);
}

.v-icon-12 {
  position: absolute;
  top: 82.5%;
  left: 72.1%;
  transform: translate(-50%, -50%);
}

.v-icon-13 {
  position: absolute;
  top: 74%;
  left: 77.1%;
  transform: translate(-50%, -50%);
}

.v-icon-14 {
  position: absolute;
  top: 62%;
  left: 77.1%;
  transform: translate(-50%, -50%);
}

.v-icon-15 {
  position: absolute;
  top: 53%;
  left: 72.1%;
  transform: translate(-50%, -50%);
}

.v-icon-16 {
  position: absolute;
  top: 52.8%;
  left: 62.9%;
  transform: translate(-50%, -50%);
}


.v-icon-17 {
  position: absolute;
  top: 38.2%;
  left: 30.4%;
  transform: translate(-50%, -50%);
}

.v-icon-18 {
  position: absolute;
  top: 22.3%;
  left: 37.3%;
  transform: translate(-50%, -50%);
}

.v-icon-19 {
  position: absolute;
  top: 15.3%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.v-icon-20 {
  position: absolute;
  top: 22.3%;
  left: 63.4%;
  transform: translate(-50%, -50%);
}

.v-icon-21 {
  position: absolute;
  top: 38.2%;
  left: 69.8%;
  transform: translate(-50%, -50%);
}
.help {
  top: 10px;
  right: 10px;
  
}
.continue {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.help-class{
    display: flex;
    justify-content: flex-end;
}

/* Continue this pattern for the rest of the icons */

</style>
