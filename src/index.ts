import path from "path";
import fs from "fs";

export { default as createHttpService } from "./createHttpService";
export { default as createHttpRoutes } from "./createHttpRoutes";
export { default as createAmqpService } from "./createAmqpService";
export { default as createAmqpSubs } from "./createAmqpSubs";
export * from "./types";
export * from "./http/httpParams";
export * from "./amqp/amqpChannel";
export * from "./amqp/amqpConnect";
export * from "./amqp/amqpQueue";
export * from "./amqp/amqpExchange";
export * from "./amqp/amqpPublish";
export * from "./hooks/useBlockingQueue";
export * from "./hooks/useChannel";
export * from "./context";

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
      console.log(err);
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

  console.log(config.name, " : shutting down tinqjs service...");

  process.exit();
};

process.on("unhandledRejection", (reason, promise) => {
  console.log(reason);

  if (process.send) process.send({ type: "shutdown" });

  process.exit();
});

process.on("message", ({ type }) => {
  if (type === "shutdown") shutdown();
});

process.on("SIGINT", shutdown);
process.on("SIGHUP", shutdown);
process.on("SIGTERM", shutdown);
