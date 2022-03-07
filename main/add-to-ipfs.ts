import logger from "./logger";
import { mainContext } from "./background";
import { dataUrlToBlob } from "./utils/dataurl-to-blob";

type FileType = "image" | "filepath" | "json";

const addImage = async (ipfs, file, pin) => {
  const blob = dataUrlToBlob(file);
  const cid = await ipfs.add(blob, { pin: pin });

  return cid;
};

const addToIpfs = async (
  { getIpfsd }: mainContext,
  files,
  fileType: FileType,
  pin: Boolean
) => {
  const ipfsd = await getIpfsd();
  if (!ipfsd) return;

  const successes = [];
  const failures = [];

  const log = logger.start("[add to ipfs] started");

  await Promise.all(
    files.map(async (file) => {
      try {
        let res = null;
        if (fileType === "image") res = await addImage(ipfsd.api, file, pin);
        successes.push(res);
      } catch (e) {
        failures.push(e.toString());
      }
    })
  );

  if (failures.length > 0) {
    log.fail(new Error(failures.join("\n")));
  } else {
    log.end();
  }

  return { successes: successes, failures: failures };
};

export default addToIpfs;
