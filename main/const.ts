import os from "os";
import packageJson from "../package.json";

const CommonConst = Object.freeze({
  IS_MAC: os.platform() === "darwin",
  IS_WIN: os.platform() === "win32",
  IS_APPIMAGE: typeof process.env.APPIMAGE !== "undefined",
  VERSION: packageJson.version,
  ELECTRON_VERSION: process.versions.electron,
  GO_IPFS_VERSION: packageJson.dependencies["go-ipfs"],
});

export default CommonConst;
