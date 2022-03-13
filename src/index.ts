import path from "path";
import fs from "fs";
import { Logger } from "./logger";

export * from "./createHttpService";
export * from "./types";
export * from "./logger";

export default function main(boot: (config: any) => Promise<void>) {
  const config = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), "tinqjs-service.config.json"),
      "utf-8"
    )
  );

  // this.name = "hello";

  boot
    .bind(this)(config)
    .catch((err) => {
      Logger.logger.error(err);
      if (process.send) process.send({ type: "shutdown" });

      process.nextTick(() => process.exit());
    });
}

const shutdown = () => {
  const config = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), "tinqjs-service.config.json"),
      "utf-8"
    )
  );

  Logger.logger.warn(`shutting down tinqjs service (${config.name})...`);

  process.exit();
};

process.on("unhandledRejection", (reason: any, promise) => {
  Logger.logger.error(reason);
  Logger.logger.error(reason.stack);

  if (process.send) process.send({ type: "shutdown" });

  process.exit();
});

process.on("message", ({ type }) => {
  if (type === "shutdown") shutdown();
});

process.on("SIGINT", shutdown);
process.on("SIGHUP", shutdown);
process.on("SIGTERM", shutdown);
