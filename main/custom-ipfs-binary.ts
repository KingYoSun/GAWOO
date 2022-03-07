import { app, dialog } from "electron";
import { showDialog } from "./dialogs";
import logger from "./logger";
import store from "./store";
import dock from "./utils/dock";
import i18n from "i18next";

const SETTINGS_KEY = "binaryPath";

async function setCustomBinary(ctx) {
  await dock.run(async () => {
    logger.info("[custom binary] request to change");
    let opt = showDialog({
      title: i18n.t("setCustomIpfsBinaryConfirmation.title"),
      message: i18n.t("setCustomIpfsBinaryConfirmation.message"),
      type: "warning",
      showDock: false,
      buttons: [i18n.t("yes"), i18n.t("no")],
    });

    if (opt !== 0) {
      logger.info("[custom binary] user canceled");
      return;
    }

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: i18n.t("pickCustomIpfsBinary"),
      defaultPath: app.getPath("home"),
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) {
      logger.info("[custom binary] user canceled");
      return;
    }

    store.set(SETTINGS_KEY, filePaths[0]);

    opt = showDialog({
      title: i18n.t("setCustomIpfsBinarySuccess.title"),
      message: i18n.t("setCustomIpfsBinarySuccess.message", {
        path: filePaths[0],
      }),
      showDock: false,
      buttons: [i18n.t("restart"), i18n.t("close")],
    });

    logger.info(`[custom binary] updated to ${filePaths[0]}`);

    if (opt === 0) ctx.restartIpfs();
  });
}

function clearCustomBinary(ctx) {
  store.delete(SETTINGS_KEY);
  logger.info("[custom binary] cleared");

  const opt = showDialog({
    title: i18n.t("clearCustomIpfsBinarySuccess.title"),
    message: i18n.t("clearCustomIpfsBinarySuccess.message"),
    buttons: [i18n.t("restart"), i18n.t("close")],
  });

  if (opt === 0) ctx.restartIpfs();
}

function hasCustomBinary() {
  return typeof store.get(SETTINGS_KEY) === "string";
}

function getCustomBinary() {
  if (hasCustomBinary) return store.get(SETTINGS_KEY);
}

export { setCustomBinary, clearCustomBinary, hasCustomBinary, getCustomBinary };
