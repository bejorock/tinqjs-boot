import { RequestListener } from "http";
import path from "path";
import http from "http";
import os from "os";

export default function createHttpServer(handler: RequestListener) {
  const PATH = path.join(
    os.platform() === "win32" ? "\\\\?\\pipe" : "/tmp",
    process.argv[2] || "default"
  );

  const server = http.createServer(handler);

  if (process.send || process.env.CHILD) {
    process.send({ socketPath: PATH });

    // graceful shutdown
    const shutdown = () => {
      console.log("shutting down slave");
      server.close();

      process.exit();
    };

    // process.on("beforeExit", shutdown);
    process.on("SIGINT", shutdown);

    process.on("message", (message) => {
      if (message === "shutdown") {
        shutdown();
      }
    });
  }

  return function listen(port: number, cb: () => void) {
    if (process.send || process.env.CHILD) server.listen(PATH, cb);
    else server.listen(port, cb);
  };
}
