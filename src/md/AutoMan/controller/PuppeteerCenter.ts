// 自动化脚本核心类

import { api } from '../../../utils/api';
import { EventEmitter2 } from 'eventemitter2';
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web';
import { Puppeteer, Browser } from 'puppeteer-core/lib/cjs/puppeteer/api-docs-entry';
import { SandBox } from './sandBox';

interface IPuppeteerCenterOptions {
  remoteDebuggingPort?: string;
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
  remoteDebuggingPort?: string;
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
    const data = await api<IChromeVersion>(
      `http://localhost:${this.remoteDebuggingPort}/json/version`,
    );
    if (data) {
      this.chromeVersion = data;
    }
  }

  dispatchMessage(error: any) {
    this.emit('message', error);
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

  async disConnect() {
    await this.browser?.disconnect();
    this.connectionStatus = ConnectionStatus.unConnection;
  }

  async connect(remoteDebuggingPort?: string) {
    this.emit('message', '开始连接 chrome...');
    this.connectionStatus = ConnectionStatus.connecting;
    try {
      this.remoteDebuggingPort = remoteDebuggingPort || this.remoteDebuggingPort;

      if (!this.remoteDebuggingPort) {
        throw new Error('browser/connect: 请提供chrome的远程调试端口');
      }

      await this.getChromeVersion();

      if (this.chromeVersion?.webSocketDebuggerUrl) {
        this.browser = await this.puppeteer.connect({
          browserWSEndpoint: this.chromeVersion.webSocketDebuggerUrl,
        });
      } else {
        throw new Error(
          `browser/connect: 没有获取到 webSocketDebuggerUrl, 请确认远程调试端口是否生效-> 浏览器访问localhost:${this.remoteDebuggingPort}/json/version查看`,
        );
      }
      this.connectionStatus = ConnectionStatus.success;
      this.emit('message', `连接成功\nchrome 版本信息：\n${JSON.stringify(this.chromeVersion)}`);
    } catch (error) {
      this.connectionStatus = ConnectionStatus.failed;
      this.dispatchMessage(error.stack);
      throw error;
    }
  }

  setEnv() {
    if (this.browser) {
      this.emit('message', '设置sandBox环境变量 puppeteer browser');
      this.sandBox.initEnv({
        puppeteer: this.puppeteer,
        browser: this.browser,
      });
    }
  }

  runScript(code: string) {
    try {
      this.sandBox.runAsyncEval(code);
    } catch (error) {
      this.dispatchMessage(error);
    }
  }
}
