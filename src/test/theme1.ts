import {
  ArchivePage,
  DetailPgae,
  HomePage,
  Plugin, SystemConfigsSchema
} from '../index';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const readme = readFileSync(resolve(__dirname, 'readme.md'), 'utf8')

@HomePage.Injectable()
class MyHomePage extends HomePage {
  public async state(data: { page: number, type: string, category: number, url: string }) {
    return {
      value: 'home',
      page: data.page,
      type: data.type,
      category: data.category,
    }
  }

  public render(data: ReturnType<MyHomePage['state']> extends Promise<infer U> ? U : never) {
    return `<script>var INITIALZIE = ${JSON.stringify(data)}</script><body>hello</body>`
  }
}

@DetailPgae.Injectable()
class MyDetailPgae extends DetailPgae {
  public state(data: { page: number, token: string }) {
    return {
      value: 'detail',
      page: data.page,
      token: data.token,
    }
  }

  public render(data: ReturnType<MyDetailPgae['state']> extends Promise<infer U> ? U : never) {
    return `<script>var INITIALZIE = ${JSON.stringify(data)}</script><body>hello</body>`
  }
}

@ArchivePage.Injectable()
class MyArchivePage extends ArchivePage {
  public state(data: { page: number }) {
    return {
      value: 'archive',
      page: data.page
    }
  }

  public render(data: ReturnType<MyArchivePage['state']> extends Promise<infer U> ? U : never) {
    return `<script>var INITIALZIE = ${JSON.stringify(data)}</script><body>hello</body>`
  }
}

@Plugin.Injectable()
export class BlogTheme1 extends Plugin {
  public readonly cwd: string = process.cwd();
  public readonly code: string = '0fab5236cc7429c2da0df154ef6bedff';
  public readonly version: string = '1.0.1';
  public readonly name: string = 'pjblog-theme-default';
  public readonly description: string = '使用 Modal.destroyAll() 可以销毁弹出的确认窗。通常用于路由监听当中，处理路由前进、后退不能销毁确认对话框的问题。A ReactJS image Viewer Component for mobile 一款基于react的图片预览组件，特别适合于异步获取的富文本中的图片，点击图片即可全屏显示，并且带有轮播';
  public readonly readme: string = readme;
  public readonly cover: string = '/-/attachment/6';
  public readonly advanceStaticDirectory: string = null;
  public previews: string[] = ['/-/attachment/5', '/-/attachment/4', '/-/attachment/3']
  public readonly schema = SystemConfigsSchema;

  public async initialize() {
    await this.$theme('home', MyHomePage);
    await this.$theme('detail', MyDetailPgae);
    await this.$theme('archive', MyArchivePage);
  };
}