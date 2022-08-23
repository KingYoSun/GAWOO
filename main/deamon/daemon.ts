import Ctl from "ipfsd-ctl";
import { showDialog } from "../dialogs";
import logger from "../logger";
import { getCustomBinary } from "../custom-ipfs-binary";
import i18n from "i18next";
import {
  applyDefaults,
  migrateConfig,
  checkCorsConfig,
  checkPorts,
  configExists,
  rmApiFile,
  apiFileExists,
} from "./config";
import showMigrationPrompt from "./migration-prompt";

function cannotConnectDialog(addr) {
  showDialog({
    title: i18n.t("cannotConnectToApiDialog.title"),
    message: i18n.t("cannotConnectToApiDialog.message", { addr }),
    type: "error",
    buttons: [i18n.t("close")],
  });
}

function getIpfsBinPath() {
  return (
    process.env.IPFS_GO_EXEC ||
    getCustomBinary() ||
    require("go-ipfs").path().replace("app.asar", "app.asar.unpacked")
  );
}

async function spawn({ flags, path }) {
  const ipfsBin = getIpfsBinPath();

  const ipfsd = await Ctl.createController({
    ipfsHttpModule: require("ipfs-http-client"),
    ipfsBin,
    ipfsOptions: {
      repo: path,
    },
    remote: false,
    disposable: false,
    test: false,
    args: flags,
  });

  if (configExists(ipfsd)) {
    migrateConfig(ipfsd);
    checkCorsConfig(ipfsd);
    return { ipfsd, isRemote: false };
  }

  // If config does not exist, but $IPFS_PATH/api exists, then
  // it is a remote repository.
  if (apiFileExists(ipfsd)) {
    return { ipfsd, isRemote: true };
  }

  await ipfsd.init();

  applyDefaults(ipfsd);
  return { ipfsd, isRemote: false };
}

function listenToIpfsLogs(ipfsd, callback) {
  let stdout, stderr;

  const listener = (data) => {
    callback(data.toString());
  };

  const interval = setInterval(() => {
    if (!ipfsd.subprocess) {
      return;
    }

    stdout = ipfsd.subprocess.stdout;
    stderr = ipfsd.subprocess.stderr;

    stdout.on("data", listener);
    stderr.on("data", listener);

    clearInterval(interval);
  }, 20);

  const stop = () => {
    clearInterval(interval);

    if (stdout) stdout.removeListener("data", listener);
    if (stderr) stderr.removeListener("data", listener);
  };

  return stop;
}

async function startIpfsWithLogs(ipfsd) {
  let err, id, migrationPrompt;
  let isMigrating, isErrored, isFinished;
  let logs = "";

  const stopListening = listenToIpfsLogs(ipfsd, (data) => {
    logs += data.toString();
    const line = data.toLowerCase();
    isMigrating = isMigrating || line.includes("migration");
    isErrored = isErrored || line.includes("error");
    isFinished = isFinished || line.includes("daemon is ready");

    if (!isMigrating) {
      return;
    }

    // Undo error state if retrying after HTTP failure
    // https://github.com/ipfs/ipfs-desktop/issues/2003
    if (
      isErrored &&
      line.includes("fetching with ipfs") &&
      !line.includes("error")
    ) {
      isErrored = false;
      if (migrationPrompt)
        migrationPrompt.loadWindow(logs, isErrored, isFinished);
    }

    if (!migrationPrompt) {
      logger.info("[daemon] ipfs data store is migrating");
      migrationPrompt = showMigrationPrompt(logs, isErrored, isFinished);
      return;
    }

    if (isErrored || isFinished) {
      // forced show on error or when finished,
      // because user could close it to run in background
      migrationPrompt.loadWindow(logs, isErrored, isFinished);
    } else {
      // update progress if the window is still around
      migrationPrompt.update(logs);
    }
  });

  try {
    await ipfsd.start();
    const idRes = await ipfsd.api.id();
    id = idRes.id;
  } catch (e) {
    err = e;
  } finally {
    // stop monitoring daemon output - we only care about migration phase
    stopListening();
    if (isErrored) {
      // save daemon output to error.log
      logger.error(logs);
    }
  }

  return {
    err,
    id,
    logs,
  };
}

export default async function daemon(opts) {
  const { ipfsd, isRemote } = await spawn(opts);
  if (!isRemote) {
    await checkPorts(ipfsd);
  }

  let errLogs = await startIpfsWithLogs(ipfsd);

  if (errLogs.err) {
    if (
      !errLogs.err.message.includes("ECONNREFUSED") &&
      !errLogs.err.message.includes("ERR_CONNECTION_REFUSED")
    ) {
      return { ipfsd, err: errLogs.err, logs: errLogs.logs };
    }

    if (!configExists(ipfsd)) {
      cannotConnectDialog(ipfsd.apiAddr.toString());
      return { ipfsd, err: errLogs.err, logs: errLogs.logs };
    }

    logger.info("[daemon] removing api file");
    rmApiFile(ipfsd);

    errLogs = await startIpfsWithLogs(ipfsd);
  }

  return { ipfsd, err: errLogs.err, logs: errLogs.logs, id: errLogs.id };
}
