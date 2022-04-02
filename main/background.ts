import { app, dialog, ipcMain, IpcMainEvent } from "electron";
import serve from "electron-serve";
import fixPath from "fix-path";
import logger from "./logger";
import { createWindow } from "./helpers";
import { criticalErrorDialog } from "./dialogs";
import setupI18n from "./i18n";
import setupDaemon from "./deamon";
import setupWaku, { WakuClient } from "./pubsub/waku";
import setupProtocolHandlers from "./protocol-handler";
import addToIpfs, { addImage } from "./add-to-ipfs";
import i18n from "i18next";
import { Controller } from "ipfsd-ctl";
import toBuffer from "it-to-buffer";
import { Post, PrismaClient, User } from "@prisma/client";
import downloadCid from "./download-cid";
import { IpfsFile, WakuClientProps, TFile } from "../renderer/types/general";
import fs from "fs-extra";
import { join } from "path";
import mime from "mime-types";
import setProtocol from "./protocol";

export interface mainContext {
  getIpfsd?: () => Controller | null;
  startIpfs?: () => Promise<any>;
  stopIpfs?: () => Promise<any>;
  restartIpfs?: () => Promise<any>;
  wakuClient?: WakuClient;
  mainWindow?: Electron.CrossProcessExports.BrowserWindow;
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
    setProtocol();

    ctx.mainWindow = createWindow("main", {
      width: 1000,
      height: 600,
    });

    if (isProd) {
      await ctx.mainWindow.loadURL("app://./index.html");
    } else {
      const port = process.argv[2];
      await ctx.mainWindow.loadURL(`http://localhost:${port}/`);
      ctx.mainWindow.webContents.openDevTools();
    }

    await setupI18n();
    await setupDaemon(ctx); // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs

    ctx.mainWindow.webContents.send("setupFinished", {
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

ipcMain.handle("confirmSetup", (event: IpcMainEvent) => {
  return Boolean(setupFinished) ? true : false;
});

ipcMain.handle(
  "createPost",
  async (
    event: IpcMainEvent,
    post: Post,
    files: Array<TFile>,
    pin: boolean
  ) => {
    if (!ctx.getIpfsd) {
      console.log(i18n.t("ipfsNotRunningDialog.title"));
      return {
        cid: "",
        failuers: [new Error(i18n.t("ipfsNotRunningDialog.title"))],
      };
    }

    const res = await addToIpfs(ctx, post, files, pin);
    post.cid = res.cid.toString();
    if (Boolean(post.cid)) await prisma.post.create({ data: post });

    return { post: post, failures: res.failures };
  }
);

ipcMain.handle(
  "indexPosts",
  async (event: IpcMainEvent, did: string, take: number) => {
    try {
      const res = await prisma.post.findMany({
        where: { authorDid: did },
        orderBy: { publishedAt: "desc" },
        take: take,
      });
      return res;
    } catch (e) {
      return e.toString();
    }
  }
);

ipcMain.handle("createUser", async (event: IpcMainEvent, user: User) => {
  try {
    delete user.id;
    const res = await prisma.user.create({ data: user });
    return res;
  } catch (e) {
    return e.toString();
  }
});

ipcMain.handle("updateUser", async (event: IpcMainEvent, user: User) => {
  try {
    const res = await prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    return res;
  } catch (e) {
    return e.toString();
  }
});

ipcMain.handle("showUser", async (event: IpcMainEvent, did: string) => {
  try {
    const res = await prisma.user.findUnique({ where: { did: did } });
    return res;
  } catch (e) {
    return e.toString();
  }
});

ipcMain.handle(
  "getFileByBase64",
  async (event: IpcMainEvent, ipfsFile: IpfsFile) => {
    const path = join(
      app.getPath("userData"),
      "downloads",
      ipfsFile.cid,
      ipfsFile.name
    );
    const base64 = await fs.readFileSync(path, { encoding: "base64" });
    const mimeType = mime.lookup(path);
    const dataurl = `data:${mimeType};base64,${base64}`;
    return dataurl;
  }
);

ipcMain.handle(
  "readLocalJson",
  async (event: IpcMainEvent, cid: string, name: string) => {
    const path = join(app.getPath("userData"), "downloads", cid, name);
    const postString = await fs.readFileSync(path, "utf8");
    const post = JSON.parse(postString);
    post.cid = cid;
    post.id = await prisma.post.findFirst({
      where: { cid: cid },
    });
    if (!Boolean(post.id)) await prisma.post.create({ data: post });

    return post;
  }
);

ipcMain.handle("countReply", async (event: IpcMainEvent, cid: string) => {
  const replyCount = await prisma.post.count({
    where: { replyToCid: cid },
  });
  return replyCount;
});

ipcMain.handle("getFullPath", (event: IpcMainEvent, type: string) => {
  let filters = [];
  let properties: ("openFile" | "multiSelections")[] = ["openFile"];

  const imageFilter = {
    name: "jpg, png, gif, webp",
    extensions: ["jpg", "png", "gif", "webp"],
  };
  if (type === "image") {
    filters.push(imageFilter);
    properties.push("multiSelections");
  }

  const videoFilter = { name: "mp4, webm", extensions: ["mp4", "webm"] };
  if (type === "video") filters.push(videoFilter);

  const files = dialog.showOpenDialogSync(ctx.mainWindow, {
    properties: properties,
    filters: filters,
  });

  return files;
});

ipcMain.handle("getPostPage", async (event: IpcMainEvent, cid: string) => {
  const basePost = await prisma.post.findFirst({
    where: { cid: cid },
  });
  let topicPost = Boolean(basePost.topicCid)
    ? await prisma.post.findFirst({
        where: { cid: basePost.topicCid },
      })
    : null;
  let postsHasTopic = await prisma.post.findMany({
    where: { topicCid: topicPost?.cid ?? basePost.cid },
    orderBy: {
      publishedAt: "asc",
    },
  });

  if (!Boolean(topicPost) && postsHasTopic.length === 0) return [basePost];
  if (!Boolean(topicPost) && postsHasTopic.length > 0) topicPost = basePost;

  const postsArr = [topicPost, ...postsHasTopic];

  return postsArr;
});

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
    const path = join(app.getPath("userData"), "images", convertedIpfsPath);
    let dataUrl = `data:${mimeType};base64,`;
    if (fs.existsSync(path)) {
      dataUrl += await fs.readFileSync(path, { encoding: "base64" });
    } else {
      const ipfsd = await ctx.getIpfsd();
      const res = await ipfsd.api.cat(convertedIpfsPath);
      const u8array = await toBuffer(res);
      await fs.outputFile(path, u8array);
      const bibnaryString = Array.from(u8array, (e) =>
        String.fromCharCode(e)
      ).join("");
      dataUrl += btoa(bibnaryString);
    }
    return dataUrl;
  }
);

ipcMain.handle("getPost", async (event: IpcMainEvent, cid: string) => {
  if (!ctx.getIpfsd) {
    console.log(i18n.t("ipfsNotRunningDialog.title"));
    return i18n.t("ipfsNotRunningDialog.title");
  }
  const ipfsd = await ctx.getIpfsd();
  let succeeded, failure;
  try {
    succeeded = await downloadCid(ipfsd, cid);
  } catch (e) {
    failure = e.toString();
  } finally {
    return { succeeded, failure };
  }
});

ipcMain.handle("initWaku", async (event: IpcMainEvent) => {
  await setupWaku(ctx);
  return true;
});

ipcMain.handle("WakuIsConnected", (event: IpcMainEvent) => {
  if (!ctx.wakuClient) return false;
  return ctx.wakuClient.connected;
});

ipcMain.handle(
  "addWakuObservers",
  async (event: IpcMainEvent, props: Array<WakuClientProps>) => {
    if (!ctx.wakuClient.connected) return "waku is not connected";
    try {
      await ctx.wakuClient.addObservers(ctx, props);
      return "succeeded";
    } catch (e) {
      return e.toString();
    }
  }
);

ipcMain.handle(
  "deleteWakuObservers",
  async (event: IpcMainEvent, props: Array<WakuClientProps>) => {
    if (!ctx.wakuClient.connected) return "waku is not connected";
    try {
      await ctx.wakuClient.deleteObservers(props);
      return "succeeded";
    } catch (e) {
      return e.toString();
    }
  }
);

ipcMain.handle(
  "sendWakuMessage",
  async (event: IpcMainEvent, prop: WakuClientProps) => {
    if (!ctx.wakuClient.connected) return "waku is not connected";
    try {
      await ctx.wakuClient.sendMessage(prop);
      return "succeeded";
    } catch (e) {
      return e.toString();
    }
  }
);
