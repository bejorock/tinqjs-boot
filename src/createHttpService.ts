import { RequestListener } from "http";
import path from "path";
import http from "http";
import https from "https";
import os from "os";

export declare type IHttpsService = {
  key: any;
  cert: any;
};

const createService = (server: http.Server) => {
  const PATH = path.join(
    os.platform() === "win32" ? "\\\\?\\pipe" : "/tmp",
    process.argv[2] || "default"
  );

  if (process.send || process.env.CHILD) {
    process.send({ type: "http init", socketPath: PATH });
  }

  return function listen(port: number, cb: () => void) {
    if (process.send || process.env.CHILD) server.listen(PATH, cb);
    else server.listen(port, cb);

    return server;
  };
};

export const createHttpService = (handler: RequestListener) => {
  const server = http.createServer(handler);

  return createService(server);
};

export const createHttpsService = (
  options: IHttpsService,
  handler: RequestListener
) => {
  const server = https.createServer(options, handler);

  return createService(server);
};
