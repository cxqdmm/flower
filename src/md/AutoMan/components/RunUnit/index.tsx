/**
 *  自动化脚本执行单元
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import PuppeteerCenter, { ConnectionStatus } from '../../controller/PuppeteerCenter';
import { Button, Divider, Input, Row, Col, Result, Select } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { find } from 'lodash';
import './index.less';
import 'codemirror/lib/codemirror.css';
import 'codemirror/lib/codemirror.js';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import { Page } from 'puppeteer-core/lib/cjs/puppeteer/common/Page';

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
      return <Result status="success" />;
    } else if (connectionStatus === ConnectionStatus.failed) {
      return <Result status="error" />;
    }
    return '未连接';
  }, [connectionStatus]);

  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div className={`${PREFIX}-left`}>
        <CodeMirror
          className={`${PREFIX}-edit`}
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
      <div className={`${PREFIX}-right`}>
        <div className={`${PREFIX}-rightAction`}>
          <Divider orientation="left" plain>
            <div className={`${PREFIX}-title`}>
              <span className={`${PREFIX}-titleMain`}>目标Chrome</span>
              <Divider type="vertical" />
              {connectionDesc}
            </div>
          </Divider>

          <Row>
            <Col span={16}>
              <Input placeholder="远程调试端口" onChange={handlePortChange} />
            </Col>
            <Col span={8}>
              <Button onClick={connectSwitch}>
                {connectionStatus === ConnectionStatus.success ? '断开' : '连接'}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <div>激活的页面</div>
              <Select
                onChange={handleSelectPage}
                className={`${PREFIX}-pageSelect`}
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
            </Col>
          </Row>
        </div>
        <div>
          <Button onClick={run}>执行</Button>
        </div>
      </div>
    </div>
  );
});

export default RunUnit;
