import { dialog } from "electron";
import CommonConst from "../const";
import dock from "../dock";
import i18n from "i18next";

const Dialog = ({
  title,
  message,
  type = "info",
  showDock = true,
  buttons = [i18n.t("ok"), i18n.t("cancel")],
  ...opts
}) => {
  const options = {
    type: type,
    buttons: buttons,
    noLink: true,
    message: "",
    detail: "",
    title: "",
    defaultId: 0,
    cancelId: 1,
    ...opts,
  };

  if (CommonConst.IS_MAC) {
    options.message = title;
    options.detail = message;
  } else {
    options.title = title;
    options.message = message;
  }

  if (!CommonConst.IS_MAC) {
    options.buttons.reverse();
  }

  if (buttons.length > 1) {
    options.defaultId = !CommonConst.IS_MAC ? buttons.length - 1 : 0;
    options.cancelId = !CommonConst.IS_MAC ? buttons.length - 2 : 1;
  }

  if (showDock) dock.show();
  const selected = dialog.showMessageBoxSync(options);
  if (showDock) dock.hide();

  if (CommonConst.IS_MAC) {
    return selected;
  }

  return buttons.length - selected - 1;
};

export default Dialog;
