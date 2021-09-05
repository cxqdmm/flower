// 自动化脚本核心类

import { api } from '../../../utils/api';
import { EventEmitter2 } from 'eventemitter2';
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web';
import { Puppeteer, Browser } from 'puppeteer-core/lib/cjs/puppeteer/api-docs-entry';
import { SandBox } from './sandBox';

interface IPuppeteerCenterOptions {
  remoteDebuggingPort?: number;
}

interface IChromeVersion {
  Browser: string;
  'Protocol-Version': string;
  'User-Agent': string;
  'V8-Version': string;
  'WebKit-Version': string;
  webSocketDebuggerUrl: string;
}

export enum ConnectionStatus {
  unConnection = '未连接',
  success = '连接成功',
  failed = '连接失败',
  connecting = '连接中',
}
export default class PuppeteerCenter extends EventEmitter2 {
  remoteDebuggingPort?: number;
  chromeVersion?: IChromeVersion;
  sandBox: SandBox;
  puppeteer!: Puppeteer;
  browser?: Browser;
  _connectionStatus?: ConnectionStatus;
  constructor(options: IPuppeteerCenterOptions = {}) {
    super();
    this.puppeteer = puppeteer;
    this.sandBox = new SandBox();
    this.remoteDebuggingPort = options.remoteDebuggingPort;
  }

  async getChromeVersion() {
    try {
      const data = await api<IChromeVersion>(
        `http://localhost:${this.remoteDebuggingPort}/json/version`,
      );
      if (data) {
        this.chromeVersion = data;
      }
    } catch (error) {
      this.emit('error', error);
      // throw Error(error);
    }
  }

  dispatchError(error: any) {
    this.emit('error', error);
    // throw Error(error);
  }

  set connectionStatus(status: ConnectionStatus) {
    this._connectionStatus = status;
    switch (status) {
      case ConnectionStatus.success:
        this.setEnv();
        break;
    }
    this.emit('connectStatus', status);
  }

  async connect(remoteDebuggingPort?: number) {
    this.connectionStatus = ConnectionStatus.connecting;
    try {
      if (remoteDebuggingPort) {
        this.remoteDebuggingPort = remoteDebuggingPort;
      } else {
        if (this.remoteDebuggingPort) {
          this.dispatchError('browser/connect: 请提供chrome的远程调试端口');
          return;
        }
      }
      await this.getChromeVersion();

      if (this.chromeVersion?.webSocketDebuggerUrl) {
        this.browser = await puppeteer.connect({
          browserWSEndpoint: this.chromeVersion.webSocketDebuggerUrl,
        });
      } else {
        this.dispatchError(
          `browser/connect: 没有获取到 webSocketDebuggerUrl, 请确认远程调试端口是否生效-> 浏览器访问localhost:${this.remoteDebuggingPort}/json/version查看`,
        );
        return;
      }
      this.connectionStatus = ConnectionStatus.success;
    } catch (error) {
      this.connectionStatus = ConnectionStatus.failed;
    }
  }

  setEnv() {
    if (this.browser)
      this.sandBox.initEnv({
        puppeteer: this.puppeteer,
        browser: this.browser,
      });
  }

  runScript(code: string) {
    try {
      this.sandBox.runAsyncEval(code);
    } catch (error) {
      this.dispatchError(error);
    }
  }
}
