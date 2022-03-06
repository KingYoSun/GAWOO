import dialog from "./dialog";
import { STATUS } from "../deamon/const";
import logger from "../logger";
import i18n from "i18next";

const ipfsNotRunningDialog = async (startIpfs) => {
  logger.info("[ipfs-not-running] an action needs ipfs to be running");

  const option = dialog({
    title: i18n.t("ipfsNotRunningDialog.title"),
    message: i18n.t("ipfsNotRunningDialog.message"),
    buttons: [i18n.t("start"), i18n.t("cancel")],
  });

  if (option !== 0) return false;

  return (await startIpfs()) === STATUS.STARTING_FINISHED;
};

export default ipfsNotRunningDialog;
