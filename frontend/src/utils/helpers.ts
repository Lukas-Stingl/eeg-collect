import { useRoute, useRouter } from "vue-router";

export const URL_PARAMS = {
  participantIdParam: "AbXHPCkszw",
  passPhrase: "aHCWFRZvlU",
  channelConfig: "wlmtdoqtqe",
};

const DECODED_PASSPHRASE = "iism4ever";

export const getIsPassphraseValid = async (): Promise<boolean> => {
  const urlRoute = useRoute();
  const router = useRouter();

  await router.isReady();

  const passphrase = urlRoute.query[URL_PARAMS.passPhrase];
  if (passphrase) {
    return atob(`${passphrase}`) === DECODED_PASSPHRASE;
  }

  return false;
};
