import logger from "./logger";
import { mainContext } from "./background";
import { dataUrlToBlob } from "./utils/dataurl-to-blob";
import fs from "fs-extra";
import { extname, basename } from "path";
import { ImportCandidate } from "ipfs-core-types/src/utils";
import { Post } from "@prisma/client";
import { TFile } from "../renderer/types/general";

export const addImage = async (
  { getIpfsd }: mainContext,
  file: string,
  pin: boolean
) => {
  const log = logger.start("[add image to ipfs] started");

  const blob = dataUrlToBlob(file);
  const ipfsd = await getIpfsd();
  if (!ipfsd) return;

  try {
    const res = await ipfsd.api.add(blob as ImportCandidate, { pin: pin });
    log.end();
    return res.cid.toString();
  } catch (e) {
    log.fail(e);
    log.end();
    return e;
  }
};

const addJson = async (ipfs, post, pin) => {
  const filename = `${post.authorName}_${post.publishedAt}.json`;
  delete post.cid;
  const res = await ipfs.add(JSON.stringify(post), { pin: pin });
  const cid = res.cid;
  await copyFileToMfs(ipfs, cid, filename);

  return { cid, filename };
};

const copyFileToMfs = async (ipfs, cid, filename) => {
  let i = 0;
  const ext = extname(filename);
  const base = basename(filename, ext);

  while (true) {
    const newName = (i === 0 ? base : `${base} (${i})`) + ext;

    try {
      await ipfs.files.stat(`/${newName}`);
    } catch (err) {
      filename = newName;
      break;
    }
    i++;
  }

  return ipfs.files.cp(`/ipfs/${cid.toString()}`, `/${filename}`);
};

const addFileOrDirectory = async (ipfs, file, pin) => {
  const blob = dataUrlToBlob(file.url);
  const res = await ipfs.add(blob, { pin: pin });
  const cid = res.cid;

  await copyFileToMfs(ipfs, cid, file.name);
  return { cid, filename: file.name };
};

const getShareableCid = async (ipfs, files) => {
  const dirpath = `/zzzz_${Date.now()}`;
  await ipfs.files.mkdir(dirpath, {});

  for (const { cid, filename } of files) {
    await ipfs.files.cp(`/ipfs/${cid}`, `${dirpath}/${filename}`);
  }

  const stat = await ipfs.files.stat(dirpath);

  await ipfs.files.rm(dirpath, { recursive: true });

  return { cid: stat.cid, filename: "" };
};

const addToIpfs = async (
  { getIpfsd }: mainContext,
  post: Post,
  files: Array<TFile>,
  pin: Boolean
) => {
  const ipfsd = await getIpfsd();
  if (!ipfsd) return;

  const successes = [];
  const failures = [];

  const log = logger.start("[add to ipfs] started");

  await Promise.all([
    (async () => {
      try {
        const res = await addJson(ipfsd.api, post, pin);
        successes.push(res);
      } catch (e) {
        failures.push(e.toString());
      }
    })(),
    ...files.map(async (file) => {
      try {
        const res = await addFileOrDirectory(ipfsd.api, file, pin);
        successes.push(res);
      } catch (e) {
        failures.push(e.toString());
      }
    }),
  ]);

  if (failures.length > 0) {
    log.fail(new Error(failures.join("\n")));
  } else {
    log.end();
  }

  const { cid, filename } = await getShareableCid(ipfsd.api, successes);

  return { cid: cid, failures: failures };
};

export default addToIpfs;
