<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import { PhArrowSquareOut } from "@phosphor-icons/vue";

const handleOpenProjectWebsite = () => {
  window.open("https://github.com/Lukas-Stingl/eeg-collect", "_blank");
};
const handleOpenKITWebsite = () => {
  window.open("https://im.iism.kit.edu", "_blank");
};
const handleOpenContactForm = () => {
  window.open("https://im.iism.kit.edu/team_1261.php", "_blank");
};
</script>

<template>
  <BasePage heading="Saved to KIT Server">
    <VCol class="mb-14">
      <p
        style="
          color: #737373;
          text-align: center;
          font-weight: 500;
          font-size: 18px;
        "
      >
        Thank you for participating! <br />
        The recording has ended and the data has been saved successfully. You
        can now close this website and return to the survey.
      </p>
    </VCol>

    <VCol class="ga-3" style="width: auto; max-width: unset">
      <h3 class="ml-5" style="color: #737373">Learn more</h3>

      <VRow class="ga-4" style="flex-wrap: nowrap">
        <VCard
          class="pa-5 rounded-xl justify-lg-space-between"
          @click="handleOpenProjectWebsite"
          style="
            width: 250px;
            height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          "
        >
          <PhArrowSquareOut
            size="18px"
            style="position: absolute; top: 20px; right: 20px"
          />

          <VCardTitle>The Project</VCardTitle>

          <p
            style="
              color: #737373;
              text-align: start;
              font-weight: 500;
              font-size: 13px;
            "
          >
            Thank you for participating! You can read more about this project
            here.
          </p>
        </VCard>

        <VCard
          class="pa-5 rounded-xl justify-lg-space-between"
          @click="handleOpenKITWebsite"
          style="
            width: 250px;
            height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          "
        >
          <PhArrowSquareOut
            size="18px"
            style="position: absolute; top: 20px; right: 20px"
          />

          <VCardTitle>KIT WIN</VCardTitle>

          <VRow class="w-100 d-block">
            <VRow>
              <p
                style="
                  color: #737373;
                  text-align: start;
                  font-weight: 500;
                  font-size: 13px;
                "
              >
                Learn more about the KIT Institute for Information Systems
                (WIN).
              </p>
            </VRow>
          </VRow>
        </VCard>

        <VCard
          class="pa-5 rounded-xl justify-lg-space-between"
          @click="handleOpenContactForm"
          style="
            width: 250px;
            height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          "
        >
          <PhArrowSquareOut
            size="18px"
            style="position: absolute; top: 20px; right: 20px"
          />

          <VCardTitle>Contact</VCardTitle>

          <VRow class="w-100 d-block">
            <VRow>
              <VCol cols="8">
                <p
                  style="
                    color: #737373;
                    text-align: start;
                    font-weight: 500;
                    font-size: 14px;
                  "
                >
                  Dr. Michael Knierim
                </p></VCol
              >
            </VRow>
            <VRow>
              <VCol cols="3">
                <p
                  style="
                    color: #737373;
                    text-align: start;
                    font-weight: 500;
                    font-size: 13px;
                  "
                >
                  Phone
                </p></VCol
              >
              <VCol cols="8">
                <p
                  style="
                    color: #737373;
                    text-align: start;
                    font-weight: 500;
                    font-size: 13px;
                  "
                >
                  +49 (721) 608-48385
                </p></VCol
              >
            </VRow>
            <VRow>
              <VCol cols="3">
                <p
                  style="
                    color: #737373;
                    text-align: start;
                    font-weight: 500;
                    font-size: 13px;
                  "
                >
                  Mail
                </p></VCol
              >
              <VCol cols="9">
                <p
                  style="
                    color: #737373;
                    text-align: start;
                    font-weight: 500;
                    font-size: 13px;
                  "
                >
                  michael.knierim@kit.edu
                </p></VCol
              >
            </VRow>
          </VRow>
        </VCard>
      </VRow>
    </VCol>
  </BasePage>
</template>
<style scoped>
div.v-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

div.v-card:hover {
  transform: scale(1.04) rotate(3deg);
}
</style>
