import { join, dirname } from "path";
import fs from "fs-extra";
import i18n from "i18next";
import all from "it-all";
import { app } from "electron";
import logger from "./logger";
import { showDialog } from "./dialogs";
import { Controller } from "ipfsd-ctl";
import toBuffer from "it-to-buffer";

const saveFile = async (dir, file) => {
  const destination = join(dir, file.path);
  if (!destination.startsWith(dir)) {
    throw new Error(`unable to create '${file.path}' outside of '${dir}'`);
  }
  if (fs.existsSync(destination)) {
    console.log(
      `unable to create '${file.path}' as it already exists at '${destination}'`
    );
    return;
  }

  const subDir = dirname(destination);
  if (fs.existsSync(subDir)) {
    const realRootDir = await fs.realpath(dir);
    const realSubDir = await fs.realpath(subDir);
    if (!realSubDir.startsWith(realRootDir)) {
      throw new Error(
        `unable to create subdir '${realSubDir}' outside of '${realRootDir}'`
      );
    }
  }
  await fs.outputFile(destination, file.content);
};

const getLs = async (ipfs, cid: string) => {
  return all(
    (async function* () {
      for await (const file of ipfs.ls(cid)) {
        yield { ...file };
      }
    })()
  );
};

const get = async (ipfs, filelist) => {
  return await Promise.all(
    filelist.map(async (fileObj) => {
      const res = await ipfs.get(fileObj.cid.toString());
      const content = await toBuffer(res);
      return { path: fileObj.path, content };
    })
  );
};

const downloadCid = async (ipfsd: Controller, cid: string) => {
  const dir = join(app.getPath("userData"), "downloads", cid);

  let files;
  try {
    logger.info(`[cid download] downloading ${cid}: started`);
    const filelist = await getLs(ipfsd.api, cid);
    logger.info(`[cid download] filelist ${cid}: ${JSON.stringify(filelist)}`);
    files = await get(ipfsd.api, filelist);
    logger.info(`[cid download] downloading ${cid}: completed`);
  } catch (err) {
    logger.error(`[cid download] ${err.stack}`);

    showDialog({
      title: i18n.t("couldNotGetCidDialog.title"),
      message: i18n.t("couldNotGetCidDialog.message", { cid }),
      buttons: [i18n.t("close")],
    });

    return;
  }

  try {
    await Promise.all(
      files.filter((file) => !!file.content).map((file) => saveFile(dir, file))
    );

    const arrFilePath = files.map((file) => file.path);

    return JSON.stringify(arrFilePath);
  } catch (err) {
    const errMsg = err.toString();
    logger.error(`[cid download] ${errMsg}`);

    showDialog({
      title: i18n.t("couldNotSaveDialog.title"),
      message: i18n.t("couldNotSaveDialog.message", { dir, error: errMsg }),
      buttons: [i18n.t("close")],
    });
  }
};

export default downloadCid;
