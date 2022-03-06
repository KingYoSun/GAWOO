import { app, dialog, ipcMain, IpcMainEvent } from "electron";
import serve from "electron-serve";
import fixPath from "fix-path";
import logger from "./logger";
import { createWindow } from "./helpers";
import { criticalErrorDialog } from "./dialogs";
import setupI18n from "./i18n";
import setupDaemon from "./deamon";
import setupProtocolHandlers from "./protocol-handler";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

if (app.dock) app.dock.hide();

// fixPath();

if (!app.requestSingleInstanceLock()) {
  process.exit(0);
}

const ctx = {};

app.on("will-finish-launching", () => {
  setupProtocolHandlers(ctx);
});

function handleError(err) {
  // Ignore network errors that might happen during the
  // execution.
  if (err.stack.includes("net::")) {
    return;
  }

  logger.error(err);
  criticalErrorDialog(err);
}

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

(async () => {
  try {
    await app.whenReady();
  } catch (e) {
    dialog.showErrorBox("Electron could not start", e.stack);
    app.exit(1);
  }

  try {
    await setupI18n();
    await setupDaemon(ctx); // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs

    const mainWindow = createWindow("main", {
      width: 1000,
      height: 600,
    });

    if (isProd) {
      await mainWindow.loadURL("app://./index.html");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/`);
      mainWindow.webContents.openDevTools();
    }
  } catch (e) {
    handleError(e);
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

// eslint-disable-next-line max-len
// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event: IpcMainEvent, message: string) => {
  console.log(message);
  setTimeout(() => event.sender.send("message", "hi from electron"), 500);
});
