import { Context, Next } from 'koa';
import { BlogConfigStorage } from '../../modules';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { TAssets, THeaderScript } from '@coka/cli';

export async function ServerSideRender(ctx: Context, next: Next) {
  if (ctx.path.startsWith('/api')) return await next();
  const configs = await BlogConfigStorage.get();
  configs.blog_theme = resolve(process.cwd(), 'theme');
  if (!configs.blog_theme) return await next();
  const pkgfile = resolve(configs.blog_theme, 'package.json');
  if (!existsSync(pkgfile)) return await next();
  const pkg = require(pkgfile);
  const assets = transformThemeScripts((pkg.assets || {}) as TAssets);
  const serverEntryFile = resolve(configs.blog_theme, 'dist', 'server', 'entry-server.js');
  const render = require(serverEntryFile);
  await render.default({
    assets, next,
    req: ctx.req,
    res: ctx.res,
    namespace: '__COKA_VITE_INITIALIZE_STATE__',
  });
}

function transformThemeScripts(assets: TAssets) {
  const { bodyScripts, headerCsses, headerPreloadScripts, headerScripts } = assets;
  return {
    bodyScripts: formatChunk(bodyScripts),
    headerCsses: formatChunk(headerCsses),
    headerPreloadScripts: formatChunk(headerPreloadScripts),
    headerScripts: formatChunk(headerScripts),
  }
}

function addThemePrefix(url: string) {
  return '/theme' + url;
}

function formatChunk(chunks: (string | THeaderScript)[]) {
  return (chunks || []).map(chunk => {
    if (typeof chunk === 'string') return addThemePrefix(chunk);
    return {
      type: chunk.type,
      crossOrigin: chunk.crossOrigin,
      src: addThemePrefix(chunk.src),
    }
  })
}