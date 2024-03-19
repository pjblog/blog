import send from 'koa-send';
import { Application } from "@zille/application";
import { Plugin } from "../lib/plugin.lib";
import { Context, Middleware } from "koa";
import { URL } from 'node:url';
import { UserAdminableMiddleware } from '../middlewares/user.mdw';

@Application.Injectable()
export class Plugins extends Application {
  private readonly stacks = new Map<string, Plugin>();
  private readonly advances = new Map<string, string>();

  public setup() { }

  public has(name: string) {
    return this.stacks.has(name)
  }

  public get(name: string) {
    return this.stacks.get(name)
  }

  public add(name: string, plugin: Plugin) {
    this.stacks.set(name, plugin);
    if (plugin.advanceStaticDirectory) {
      this.advances.set(plugin.code, plugin.advanceStaticDirectory);
    }
    return this;
  }

  public del(name: string) {
    if (this.stacks.has(name)) {
      const plugin = this.stacks.get(name);
      if (this.advances.has(plugin.code)) {
        this.advances.delete(plugin.code);
      }
      this.stacks.delete(name);
    }
    return this;
  }

  public toArray() {
    return Array.from(this.stacks.values()).map(plugin => plugin.toJSON())
  }

  public createAdvanceServeStaticMiddleware(): Middleware {
    // path eg.: /-/control/plugin/5c59f49d2e796f5379f13e31c149abca/advance/assets/index.83u45.js
    return async (ctx, next) => {
      const doNext = async () => {
        const url = new URL('http://localhost' + ctx.url);
        if (!url.pathname.startsWith('/-/control/plugin/')) return await next();
        const pathname = url.pathname.substring('/-/control/plugin/'.length);
        const pathnamesplitor = pathname.split('/');
        if (pathnamesplitor.length < 2) return await next();
        if (pathnamesplitor[1] !== 'advance') return await next();
        if (pathnamesplitor[0].length !== 32) return await next();
        const key = pathnamesplitor[0];
        if (!this.advances.has(key)) return await next();
        const _url = pathname.substring(pathnamesplitor[0].length + 1 + pathnamesplitor[1].length) || '/';
        const directory = this.advances.get(key);
        try {
          await this.serveStatic(ctx, _url, directory);
        } catch (e) {
          if (e.status === 404) {
            await this.serveStatic(ctx, '/', directory);
          } else {
            throw e;
          }
        }
      }
      if (!ctx.user) {
        await UserAdminableMiddleware(ctx, doNext);
      } else {
        await doNext();
      }
    }
  }

  private serveStatic(ctx: Context, path: string, directory: string, maxAge = 24 * 60 * 60 * 1000) {
    return send(ctx, path, {
      root: directory,
      index: 'index.html',
      gzip: true,
      maxAge,
    })
  }
}