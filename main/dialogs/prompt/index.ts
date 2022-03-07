import { BrowserWindow, ipcMain } from "electron";
import crypto from "crypto";
import CommonConst from "../../const";
import dock from "../../utils/dock";
import makePage from "./template";
import { getBackgroundColor } from "./styles";

function generatePage({ message, defaultValue = "", buttons }, id) {
  buttons = buttons.map(
    (txt, i) =>
      `<button ${i === 0 ? 'class="default"' : ""} id="${i}">${txt}</button>`
  );

  if (CommonConst.IS_MAC) {
    buttons.reverse();
  }

  const page = makePage({ message, defaultValue, buttons, id });
  return `data:text/html;base64,${Buffer.from(page, "utf8").toString(
    "base64"
  )}`;
}

const showPrompt = async (options) => {
  options = Object.assign(
    {},
    {
      window: {},
      showDock: true,
    },
    options
  );

  const window = new BrowserWindow({
    title: options.title,
    show: false,
    width: 350,
    height: 330,
    resizable: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    backgroundColor: getBackgroundColor(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    ...options.window,
  });

  // Generate random id
  const id = crypto.randomBytes(16).toString("hex");

  return new Promise((resolve) => {
    ipcMain.once(id, (_, data) => {
      window.destroy();
      if (options.showDock) dock.hide();
      resolve(data);
    });

    window.on("close", () => {
      if (options.showDock) dock.hide();
      resolve({ input: "", button: null });
    });

    window.once("ready-to-show", () => {
      if (options.showDock) dock.show();
      window.show();
    });

    window.loadURL(generatePage(options, id));
  });
};

export default showPrompt;
