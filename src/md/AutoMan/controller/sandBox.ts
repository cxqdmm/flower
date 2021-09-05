import { Browser, Puppeteer } from 'puppeteer-core/lib/cjs/puppeteer/api-docs-entry';

interface IEnv {
  puppeteer: Puppeteer;
  browser: Browser;
}
export class SandBox {
  env!: IEnv;

  initEnv(env: IEnv) {
    this.env = env;
  }

  runAsyncEval(scriptString: string) {
    (function ({ puppeteer, browser }) {
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
