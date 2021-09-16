/**
 *  自动化脚本执行单元
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import PuppeteerCenter, { ConnectionStatus } from '../../controller/PuppeteerCenter';
import { Button, Divider, Input, Result, Select } from 'antd';
import { find } from 'lodash';
import './index.less';
import { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';
import Code from '../Code';

const PREFIX = 'RunUnit';
interface IProps {
  className?: string;
  code: string;
  onContentChange: (value: string) => void;
  onLog: (msg: any) => void;
}

const RunUnit: React.FC<IProps> = React.memo(function RunUnit(props) {
  const { className, code, onContentChange, onLog } = props;
  const [remoteDebuggingPort, setPort] = useState<string>();
  const [pages, setPages] = useState<Page[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.unConnection,
  );

  const handleLog = useCallback(
    (err) => {
      onLog(err);
    },
    [onLog],
  );

  const onConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
  }, []);

  const puppeteerCenter = useMemo(() => {
    return new PuppeteerCenter();
  }, []);
  useEffect(() => {
    puppeteerCenter.on('pageChange', (pages) => {
      setPages(pages);
    });
  }, [puppeteerCenter]);

  useEffect(() => {
    puppeteerCenter.on('log', handleLog);
    puppeteerCenter.on('connectStatus', onConnectionStatus);
    return () => {
      puppeteerCenter.off('log', handleLog);
      puppeteerCenter.off('connectStatus', onConnectionStatus);
    };
  }, [handleLog, onConnectionStatus, puppeteerCenter]);

  const connectSwitch = useCallback(async () => {
    if (connectionStatus === ConnectionStatus.success) {
      await puppeteerCenter?.disConnect();
    } else {
      await puppeteerCenter?.connect(remoteDebuggingPort);
    }
  }, [connectionStatus, puppeteerCenter, remoteDebuggingPort]);

  const run = useCallback(async () => {
    puppeteerCenter?.runScript(code);
  }, [code, puppeteerCenter]);

  const onChange = (editor: any, data: any, value: string) => {
    onContentChange(value);
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPort(e.target.value);
  };

  const handleSelectPage = (value: string) => {
    const selectedPage = find(pages, (page) => {
      // @ts-ignore
      return page._target._targetInfo.targetId === value;
    });
    if (selectedPage) {
      puppeteerCenter.emit('activePage', selectedPage);
    }
  };

  const connectionDesc = useMemo(() => {
    if (connectionStatus === ConnectionStatus.success) {
      return <Result status="success" className="m-r-10" />;
    } else if (connectionStatus === ConnectionStatus.failed) {
      return <Result status="error" className="m-r-10" />;
    }
    return <Result status="info" className="m-r-10" />;
  }, [connectionStatus]);

  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div className={`${PREFIX}-head`}>
        <div className={`${PREFIX}-chrome`}>
          {connectionDesc}
          <span className="m-r-10">远程调试端口</span>
          <Input
            placeholder="远程调试端口"
            className="m-r-10"
            size="middle"
            onChange={handlePortChange}
          />
          <Button
            onClick={connectSwitch}
            className="m-r-10"
            size="small"
            type="primary"
            shape="round"
          >
            {connectionStatus === ConnectionStatus.success ? '断开' : '连接'}
          </Button>
        </div>
        {connectionStatus === ConnectionStatus.success && (
          <>
            <Divider type="vertical" />
            <div className={`${PREFIX}-page`}>
              <div className="m-r-10">激活的页面</div>
              <Select
                onChange={handleSelectPage}
                className={`${PREFIX}-pageSelect m-r-10`}
                placeholder="选择激活的page"
              >
                {pages.map((page) => {
                  // @ts-ignore
                  const id = page._target._targetInfo.targetId;
                  // @ts-ignore
                  const title = page._target._targetInfo.title;
                  return <Select.Option value={id}>{title}</Select.Option>;
                })}
              </Select>
            </div>
            <div className={`${PREFIX}-action`}>
              <Divider type="vertical" />
              <Button onClick={run} size="small" disabled={!code} type="primary" shape="round">
                执行
              </Button>
            </div>
          </>
        )}
      </div>
      <div className={`${PREFIX}-body`}>
        <Code
          value={code}
          options={{
            mode: 'text/javascript',
            theme: 'material',
            lineNumbers: true,
            autoFocus: true,
            line: true,
          }}
          onBeforeChange={onChange}
        />
      </div>
    </div>
  );
});

export default RunUnit;
