import { Browser, Page, Puppeteer } from 'puppeteer-core/lib/cjs/puppeteer/api-docs-entry';

interface IEnv {
  puppeteer: Puppeteer;
  browser: Browser;
  log: (msg: string) => void;
  activePage?: Page;
}
export class SandBox {
  env!: IEnv;

  initEnv(env: IEnv) {
    this.env = env;
  }

  setActivePage(page: Page) {
    this.env.activePage = page;
  }

  runAsyncEval(scriptString: string) {
    (function ({ puppeteer, browser, activePage, log }) {
      const str = `
        async function runCode() {
          ${scriptString}
        }
        runCode()
      `;
      eval(str);
    })(this.env);
  }
}
