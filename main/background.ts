import { app, dialog, ipcMain, IpcMainEvent } from "electron";
import serve from "electron-serve";
import fixPath from "fix-path";
import logger from "./logger";
import { createWindow } from "./helpers";
import { criticalErrorDialog } from "./dialogs";
import setupI18n from "./i18n";
import setupDaemon from "./deamon";
import setupProtocolHandlers from "./protocol-handler";
import addToIpfs, { addImage } from "./add-to-ipfs";
import i18n from "i18next";
import { Controller } from "ipfsd-ctl";
import toBuffer from "it-to-buffer";
import { PrismaClient } from "@prisma/client";

export interface mainContext {
  getIpfsd?: () => Controller | null;
  startIpfs?: () => Promise<any>;
  stopIpfs?: () => Promise<any>;
  restartIpfs?: () => Promise<any>;
}

const isProd: boolean = process.env.NODE_ENV === "production";
let setupFinished: boolean = false;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath(
    "userData",
    `${app.getPath("userData")} (${process.env.NODE_ENV})`
  );
}

if (app.dock) app.dock.hide();

// fixPath();

if (!app.requestSingleInstanceLock()) {
  process.exit(0);
}

const ctx: mainContext = {};
const prisma = new PrismaClient();

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
    await prisma.$disconnect();
    app.exit(1);
  }

  try {
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

    await setupI18n();
    await setupDaemon(ctx); // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs

    mainWindow.webContents.send("setup_finished", {
      message: "setup finished",
    });
    setupFinished = true;
  } catch (e) {
    handleError(e);
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle("sayMsg", (event: IpcMainEvent, message: string) => {
  console.log(message);
  return "said message";
});

ipcMain.handle("confirm_setup", (event: IpcMainEvent) => {
  return Boolean(setupFinished) ? true : false;
});

ipcMain.handle(
  "addToIpfs",
  async (event: IpcMainEvent, files: Array<any>, pin: boolean) => {
    if (!ctx.getIpfsd) {
      console.log(i18n.t("ipfsNotRunningDialog.title"));
      return {
        cid: "",
        failuers: [new Error(i18n.t("ipfsNotRunningDialog.title"))],
      };
    }

    const res = await addToIpfs(ctx, files, pin);
    return res;
  }
);

ipcMain.handle(
  "imageToIpfs",
  async (event: IpcMainEvent, image: string, pin: boolean) => {
    if (!ctx.getIpfsd) {
      console.log(i18n.t("ipfsNotRunningDialog.title"));
      return new Error(i18n.t("ipfsNotRunningDialog.title"));
    }

    const res = await addImage(ctx, image, pin);
    return res;
  }
);

ipcMain.handle(
  "catImage",
  async (event: IpcMainEvent, ipfsPath: string, mimeType: string) => {
    if (!ctx.getIpfsd) {
      console.log(i18n.t("ipfsNotRunningDialog.title"));
      return i18n.t("ipfsNotRunningDialog.title");
    }
    const convertedIpfsPath = ipfsPath.replace("ipfs://", "/ipfs/");
    const ipfsd = await ctx.getIpfsd();
    const res = await ipfsd.api.cat(convertedIpfsPath);
    const u8array = await toBuffer(res);
    const bibnaryString = Array.from(u8array, (e) =>
      String.fromCharCode(e)
    ).join("");
    const dataurl = `data:${mimeType};base64,${btoa(bibnaryString)}`;
    return dataurl;
  }
);
