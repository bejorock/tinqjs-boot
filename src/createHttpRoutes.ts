import { Request, Response, Router } from "express";
import path from "path";
import { logger } from "./logger";
import { IHttpContext } from "./types";

function safeHandler(handler: (props: IHttpContext) => Promise<any>) {
  return (req: Request, res: Response) => {
    const props: IHttpContext = {
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body,
      req,
    };

    handler(props)
      .then((result) => {
        if (typeof result === "function") return result(res);
        else res.send(result);
      })
      .catch((err) => {
        logger.error(err);
        res.status(500).send(err);
      });
  };
}

export default function createHttpRoutes(descriptors: any) {
  const { default: modules, filenames } = descriptors;
  const paramsPattern = new RegExp(/(.*)\[(.+)\](.*)/, "g");

  const router = Router();

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    const filePath = filenames[i];
    const name = path.basename(filePath);
    const basePath = filePath.substr(1, filePath.length - name.length - 2);
    let routePath = "/" + [basePath, name].filter((v) => v !== "").join("/");

    while (paramsPattern.test(routePath)) {
      routePath = routePath.replace(paramsPattern, "$1:$2$3");
    }

    for (let httpMethod in module) {
      const middlewares: any[] = module.middlewares || [];

      switch (httpMethod) {
        case "get":
          router.get(routePath, middlewares, safeHandler(module[httpMethod]));
          break;

        case "post":
          router.post(routePath, middlewares, safeHandler(module[httpMethod]));
          break;

        case "put":
          router.put(routePath, middlewares, safeHandler(module[httpMethod]));
          break;

        case "patch":
          router.patch(routePath, middlewares, safeHandler(module[httpMethod]));
          break;

        case "del":
          router.delete(
            routePath,
            middlewares,
            safeHandler(module[httpMethod])
          );
          break;

        default:
          break;
      }
    }
  }

  return router;
}
