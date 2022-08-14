import { app } from "electron";
import os from "os";
import path from "path";
import packageJson from "../package.json";

const CommonConst = Object.freeze({
  IS_MAC: os.platform() === "darwin",
  IS_WIN: os.platform() === "win32",
  IS_APPIMAGE: typeof process.env.APPIMAGE !== "undefined",
  VERSION: packageJson.version,
  ELECTRON_VERSION: process.versions.electron,
  GO_IPFS_VERSION: packageJson.dependencies["go-ipfs"],
});

export const dbPath = path.join(app.getPath("userData"), "app.db");
export const dbUrl = "fileabsolute:///" + dbPath;
export const latestMigration = "20220812065922_add_jws_to_post";
export const platformToExecutables: any = {
  win32: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-windows.exe",
    queryEngine: "node_modules/@prisma/engines/query_engine-windows.dll.node",
  },
  linux: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node",
  },
  darwin: {
    migrationEngine: "node_modules/@prisma/engines/migration-engine-darwin",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-darwin.dylib.node",
  },
  darwinArm64: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-darwin-arm64",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node",
  },
};
const extraResourcesPath = app.getAppPath().replace("app.asar", "");

function getPlatformName(): string {
  const isDarwin = process.platform === "darwin";
  if (isDarwin && process.arch === "arm64") {
    return process.platform + "Arm64";
  }

  return process.platform;
}

const platformName = getPlatformName();

export const mePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].migrationEngine
);
export const qePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].queryEngine
);

export interface Migration {
  id: string;
  checksum: string;
  finished_at: string;
  migration_name: string;
  logs: string;
  rolled_back_at: string;
  started_at: string;
  applied_steps_count: string;
}

export default CommonConst;
