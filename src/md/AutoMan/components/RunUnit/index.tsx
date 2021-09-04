/**
 *  自动化脚本执行单元
 */
import React, { useCallback } from 'react';
import cls from 'classnames';
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web';
const PREFIX = 'RunUnit';

interface IProps {
  className?: string;
}

// 自动执行脚本
async function run() {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://localhost:9222/devtools/browser/e2a16a93-baa7-4c77-b69a-f5c48aea389e',
  });

  const pages = await browser.pages();
  pages[2].goto('https://www.qq.com');
  // await browser.close();
}

const RunUnit: React.FC<IProps> = React.memo(function RunUnit(props) {
  const { className } = props;
  const close = useCallback(() => {
    run();
  }, []);

  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div onClick={close}>关闭</div>
    </div>
  );
});

export default RunUnit;
