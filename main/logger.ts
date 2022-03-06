import { createLogger, format, transports } from "winston";
import { join } from "path";
import { app } from "electron";
import { performance } from "perf_hooks";

const { combine, splat, timestamp, printf } = format;
const logsPath = app.getPath("userData");

const errorFile = new transports.File({
  level: "error",
  filename: join(logsPath, "error.log"),
});

errorFile.on("finish", () => {
  process.exit(1);
});

const logger = createLogger({
  format: combine(
    timestamp(),
    splat(),
    printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: "debug",
      silent: process.env.NODE_ENV === "production",
    }),
    errorFile,
    new transports.File({
      level: "debug",
      filename: join(logsPath, "combined.log"),
    }),
  ],
});

logger.info(`[meta] logs can be found on ${logsPath}`);

export default Object.freeze({
  start: (msg: String) => {
    const start = performance.now();
    logger.info(`${msg} STARTED`);

    return {
      end: () => {
        const seconds = (performance.now() - start) / 1000;
        logger.info(`${msg} FINISHED ${seconds}s`);
      },
      info: (str) => logger.info(`${msg} ${str}`),
      fail: (err) => logger.error(`${msg} ${err.stack}`),
    };
  },
  info: (msg: String) => logger.info(msg),
  error: (msg: String) => logger.error(msg),
  logsPath,
});
