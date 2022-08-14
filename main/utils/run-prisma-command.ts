import logger from "../logger";
import path from "path";
import { mePath, qePath } from "../const";
import { fork } from "child_process";

export default async function runPrismaCommand({
  command,
  dbUrl,
}: {
  command: string[];
  dbUrl: string;
}): Promise<number> {
  logger.info(`Migration engine path ${mePath}`);
  logger.info(`Query engine path ${qePath}`);

  // Currently we don't have any direct method to invoke prisma migration programatically.
  // As a workaround, we spawn migration script as a child process and wait for its completion.
  // Please also refer to the following GitHub issue: https://github.com/prisma/prisma/issues/4703
  try {
    const exitCode = await new Promise((resolve, _) => {
      const prismaPath = path.resolve(
        __dirname,
        "..",
        "..",
        "node_modules/prisma/build/index.js"
      );
      logger.info(`Prisma path ${prismaPath}`);

      const child = fork(prismaPath, command, {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
          PRISMA_MIGRATION_ENGINE_BINARY: mePath,
          PRISMA_QUERY_ENGINE_LIBRARY: qePath,
        },
        stdio: "pipe",
      });

      child.on("message", (msg) => {
        logger.info(String(msg));
      });

      child.on("error", (err) => {
        logger.error(`Child process got error: ${err}`);
      });

      child.on("close", (code, signal) => {
        resolve(code);
      });

      child.stdout?.on("data", function (data) {
        logger.info(`prisma: ${data.toString()}`);
      });

      child.stderr?.on("data", function (data) {
        logger.error(`prisma: ${data.toString()}`);
      });
    });

    if (exitCode !== 0)
      throw Error(`command ${command} failed with exit code ${exitCode}`);

    return exitCode;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
