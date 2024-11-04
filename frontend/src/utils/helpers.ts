import { useRoute, useRouter } from "vue-router";

export const URLs = { WEB_SOCKET_URL: "ws://localhost:3001/websocket/" };

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

export const getReadableTimestamp = () => {
  const now = new Date(); // Current date and time

  // Get individual components of the date
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Format the date and time in a readable format (YYYY-MM-DD HH:MM:SS)
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
