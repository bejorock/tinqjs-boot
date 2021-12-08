import { RequestListener } from "http";
import path from "path";
import http from "http";
import os from "os";

export default function createHttpService(handler: RequestListener) {
  const PATH = path.join(
    os.platform() === "win32" ? "\\\\?\\pipe" : "/tmp",
    process.argv[2] || "default"
  );

  const server = http.createServer(handler);

  if (process.send || process.env.CHILD) {
    process.send({ type: "http init", socketPath: PATH });
  }

  return function listen(port: number, cb: () => void) {
    if (process.send || process.env.CHILD) server.listen(PATH, cb);
    else server.listen(port, cb);
  };
}
