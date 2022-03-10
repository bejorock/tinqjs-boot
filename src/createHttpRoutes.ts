import e, { Request, Response, Router } from "express";
import path from "path";
import { Logger } from ".";
import { IHttpContext } from "./types";

const tokensPattern = new RegExp(/\:(.+)/, "g");
const paramsPattern = new RegExp(/(.*)\[(.+)\](.*)/, "g");
const indexPattern = new RegExp(/(.*)\/(index)/, "g");

const safeHandler = (handler: (props: IHttpContext) => Promise<any>) => {
  return (req: Request, res: Response, next: Function) => {
    const props: IHttpContext = {
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body,
      req,
    };

    (async () => {
      const result = await handler(props);
      if (typeof result === "function") await result(res, next);
      else res.send(result);
    })().catch((err) => {
      Logger.logger.error(err);
      res.status(500).send(err);
    });
  };
};

const sortRoutes = (a: string, b: string) => {
  const aTokens = a.split("/");
  const bTokens = b.split("/");

  const result = (() => {
    // if (aTokens.length != bTokens.length)
    // return bTokens.length - aTokens.length;
    for (let i = 0; i < aTokens.length; i++) {
      if (aTokens[i] && !bTokens[i]) return -1;
      else if (!aTokens[i] && bTokens[i]) return 1;

      if (aTokens[i] !== bTokens[i]) {
        if (tokensPattern.test(aTokens[i]) && !tokensPattern.test(bTokens[i]))
          return 1;
        else if (
          !tokensPattern.test(aTokens[i]) &&
          tokensPattern.test(bTokens[i])
        )
          return -1;
        else if (
          tokensPattern.test(aTokens[i]) &&
          tokensPattern.test(bTokens[i])
        )
          return bTokens[i].length - aTokens[i].length;
      }
    }

    return 0;
  })();

  // console.log(a, b, result);
  return result;
};

const prepareRoute = (filePath: string) => {
  const name = path.basename(filePath);
  const basePath = filePath.substr(1, filePath.length - name.length - 2);
  return "/" + [basePath, name].filter((v) => v !== "").join("/");
};

const replaceBracket = (routePath: string) => {
  while (paramsPattern.test(routePath)) {
    routePath = routePath.replace(paramsPattern, "$1:$2$3");
  }

  return routePath;
};

const trimIndex = (routePath: string) => {
  while (indexPattern.test(routePath)) {
    routePath = routePath.replace(indexPattern, "$1");
  }

  return routePath;
};

const applyRoute = (routePath: string) =>
  trimIndex(replaceBracket(prepareRoute(routePath)));

export default function createHttpRoutes(descriptors: any) {
  const { default: modules, filenames } = descriptors;
  const router = Router();

  const routes = filenames
    .map(applyRoute)
    .map((f: any, i: any) => ({
      fileName: f,
      module: modules[i],
    }))
    .sort((a: any, b: any) => sortRoutes(a.fileName, b.fileName));
  // console.log(routes);
  // console.log(filenames.map(applyRoute).sort(sortRoutes), modules);

  // for (let i = 0; i < modules.length; i++) {
  // const module = modules[i];
  // const filePath = filenames[i];
  // const name = path.basename(filePath);
  // const basePath = filePath.substr(1, filePath.length - name.length - 2);
  // let routePath = "/" + [basePath, name].filter((v) => v !== "").join("/");

  /* while (paramsPattern.test(routePath)) {
      routePath = routePath.replace(paramsPattern, "$1:$2$3");
    }

    while (indexPattern.test(routePath)) {
      routePath = routePath.replace(indexPattern, "$1");
    } */

  // console.log(routePath);
  for (let i = 0; i < routes.length; i++) {
    const module = routes[i].module;
    const routePath = routes[i].fileName;

    // console.log(routePath, module);

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
