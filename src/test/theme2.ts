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
  public async state(page: number, type: string, category: number) {
    return {
      value: 'home',
      page, type, category,
    }
  }

  public render(data: ReturnType<MyHomePage['state']> extends Promise<infer U> ? U : never) {
    return `<script>var INITIALZIE = ${JSON.stringify(data)}</script><body>hello</body>`
  }
}

@DetailPgae.Injectable()
class MyDetailPgae extends DetailPgae {
  public state(page: number, token: string) {
    return {
      value: 'detail',
      page, token
    }
  }

  public render(data: ReturnType<MyDetailPgae['state']> extends Promise<infer U> ? U : never) {
    return `<script>var INITIALZIE = ${JSON.stringify(data)}</script><body>hello</body>`
  }
}

@ArchivePage.Injectable()
class MyArchivePage extends ArchivePage {
  public state(page: number) {
    return {
      value: 'archive',
      page
    }
  }

  public render(data: ReturnType<MyArchivePage['state']> extends Promise<infer U> ? U : never) {
    return `<script>var INITIALZIE = ${JSON.stringify(data)}</script><body>hello</body>`
  }
}

@Plugin.Injectable()
export class BlogTheme2 extends Plugin {
  public readonly cwd: string = process.cwd();
  public readonly code: string = '9d912bdf615ada3e16085e2191598757';
  public readonly version: string = '2.1.8';
  public readonly name: string = 'pjblog-theme-test';
  public readonly description: string = '使用 Modal.destroyAll() 可以销毁弹出的确认窗。通常用于路由监听当中，处理路由前进、后退不能销毁确认对话框的问题。';
  public readonly readme: string = readme;
  public readonly cover: string = '/-/attachment/6';
  public previews: string[] = ['/-/attachment/5', '/-/attachment/4', '/-/attachment/3']
  public readonly schema = SystemConfigsSchema;

  public async initialize() {
    await this.$theme('home', MyHomePage);
    await this.$theme('detail', MyDetailPgae);
    await this.$theme('archive', MyArchivePage);
  };
}