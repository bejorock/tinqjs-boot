import { EventEmitter } from "events";
import { Request, Response } from "express";
import { Stream } from "stream";
import { logger } from "./logger";

export const amqpEvent = new EventEmitter();

export interface Resolver {
  <T extends any>(key: any): T;
}

export interface Route {
  (resolver: Resolver): {
    (req: Request, res: Response, next?: Function): void;
  };
}

export interface RouteResponse {
  (res: Response): boolean;
}

export interface RouteHandler<T extends any[]> {
  (...deps: T): {
    (req: Request): Promise<RouteResponse>;
  };
}

export interface Service<T extends any[], R> {
  (resolver: Resolver): {
    (...args: T): Promise<R>;
  };
}
export interface ServiceHandler<T extends any[], R> {
  (...deps: any[]): {
    (...args: T): Promise<R>;
  };
}

export const RouteSuccess = (content: any): RouteResponse => {
  return (res: Response) => {
    res.status(200).send(content);
    return true;
  };
};

export const RouteNotFound = (reason: string): RouteResponse => {
  return (res: Response) => {
    res.status(404).send({ reason });
    return true;
  };
};

export const RouteError = (error: Error): RouteResponse => {
  return (res: Response) => {
    res.status(500).send({ reason: error.message, name: error.name });
    return true;
  };
};

export const RouteRedirect = (url: string): RouteResponse => {
  return (res: Response) => {
    res.redirect(url);
    return true;
  };
};

export const RouteChunked = (stream: Stream): RouteResponse => {
  return (res: Response) => {
    stream.pipe(res);
    return true;
  };
};

export const RouteContinue = (): RouteResponse => {
  return (_) => false;
};

export const BuildService =
  <T extends any[], R extends any>(
    handler: ServiceHandler<T, R>,
    ...deps: any[]
  ): Service<T, R> =>
  (resolver: Resolver) => {
    const depInstances = deps.map((d) => resolver(d));

    return handler(...depInstances);
  };

export const BuildRoute =
  (handler: RouteHandler<any>, ...deps: any[]): Route =>
  (resolver: Resolver) => {
    return (req: Request, res: Response, next?: Function) => {
      const depInstances = deps.map((d) => resolver(d));
      const exec = handler(...depInstances);

      exec(req)
        .then((write) => write(res))
        .then((done) => !done && next())
        .catch((err) => {
          logger.error(err);

          if (res.writable) res.send(err);
        });
    };
  };

export const ComposeRoutes =
  (...routes: Route[]): Route =>
  (resolver: Resolver) => {
    const expressRoutes = routes.map((r) => r(resolver));

    return (req: Request, res: Response, next?: Function) => {
      const exec = (index: number) => {
        if (index >= expressRoutes.length) return;

        const execRoute = expressRoutes[index];

        execRoute(req, res, () => exec(++index));
      };

      exec(0);
    };
  };
