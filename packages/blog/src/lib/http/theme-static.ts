import { Context, Next } from 'koa';
import { BlogConfigStorage } from '../../modules';
import { resolve } from 'path';
import { existsSync } from 'fs';
import * as send from 'koa-send';
import { HttpBadRequestException } from '@typeservice/exception';

export async function ServerThemeStatic(ctx: Context, next: Next) {
  if (!ctx.path.startsWith('/theme')) return await next();
  const configs = await BlogConfigStorage.get();
  configs.blog_theme = resolve(process.cwd(), 'theme');
  const themeStaticDictionary = resolve(configs.blog_theme, 'dist', 'client');
  if (!configs.blog_theme || !existsSync(themeStaticDictionary)) return await next();
  try {
    await send(ctx, ctx.path.substring('/theme'.length), {
      root: themeStaticDictionary,
    })
  } catch (e) {
    switch (e.status) {
      case 404: return await next();
      default: throw new HttpBadRequestException(ctx.path);
    }
  }
}