import { PrismaClient } from "@prisma/client";
import fs from "fs-extra";
import path from "path";
import { dbPath, dbUrl, latestMigration, Migration } from "../const";
import logger from "../logger";
import { app } from "electron";
import runPrismaCommand from "../utils/run-prisma-command";

function last(arr: Array<any>) {
  if (arr.length == 0) return;

  return arr[arr.length - 1];
}

export default async function checkNeedMigration(prisma: PrismaClient) {
  let needMigration;
  const dbExists = fs.existsSync(dbPath);
  if (!dbExists) {
    needMigration = true;
    fs.closeSync(fs.openSync(dbPath, "w"));
  } else {
    try {
      const latest: Migration[] =
        await prisma.$queryRaw`select * from _prisma_migrations order by finished_at`;
      logger.info(`Latest migration: ${last(latest)?.migration_name}`);
      needMigration = last(latest)?.migration_name !== latestMigration;
    } catch (e) {
      logger.error(e);
      needMigration = false;
    }
  }

  if (!needMigration) {
    logger.info("Does not need migration");
    return;
  }

  try {
    const schemaPath = path.join(
      app.getAppPath().replace("app.asar", "app.asar.unpacked"),
      "prisma",
      "schema.prisma"
    );
    logger.info(
      `Needs a migration. Running prisma migrate with schema path ${schemaPath}`
    );

    await runPrismaCommand({
      command: ["migrate", "deploy", "--schema", schemaPath],
      dbUrl,
    });
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}
