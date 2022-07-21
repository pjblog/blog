import { TCreateHTTPServerProps, HTTP } from '@typeservice/http';
import { createServer, Server } from 'http';
import { createContext } from '@typeservice/process';
import { ServerSideRender } from './ssr';
import { ServerThemeStatic } from './theme-static';
export const CONTEXT_HTTP_APPLICATION = createContext<HTTP>(undefined);
export const CONTEXT_HTTP_SERVER = createContext<Server>(undefined);
export const CONTEXT_HTTP_PORT = createContext<number>(undefined);
export type TPortGetter = () => number | Promise<number>;
export function createHTTPServer(configs: TCreateHTTPServerProps) {
  return async () => {
    const http = new HTTP(configs.container);
    if (configs.middlewares && configs.middlewares.length) {
      configs.middlewares.forEach(middleware => http.use(middleware));
    }
    http.use(http.routes());
    http.use(ServerThemeStatic);
    http.use(ServerSideRender);
    const server = createServer(http.callback());
    CONTEXT_HTTP_SERVER.setContext(server);
    if (configs.timeout !== undefined) {
      server.setTimeout(configs.timeout);
    }
    if (configs.services && configs.services.length) {
      configs.services.forEach(service => http.createService(service));
    }
    if (configs.onCreated) await Promise.resolve(configs.onCreated(server));
    const port = typeof configs.port === 'function'
      ? await Promise.resolve((configs.port as TPortGetter)())
      : configs.port;
    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: any) => {
        if (err) return reject(err);
        resolve();
      })
    })
    CONTEXT_HTTP_APPLICATION.setContext(http);
    CONTEXT_HTTP_PORT.setContext(port);
    if (configs.bootstrap) await Promise.resolve(configs.bootstrap(port));
    return async () => {
      server.close();
      CONTEXT_HTTP_APPLICATION.setContext(undefined);
      CONTEXT_HTTP_SERVER.setContext(undefined);
      if (configs.destroyed) await Promise.resolve(configs.destroyed(port));
      CONTEXT_HTTP_PORT.setContext(undefined);
    }
  }
}