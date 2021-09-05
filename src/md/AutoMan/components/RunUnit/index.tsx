/**
 *  自动化脚本执行单元
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import PuppeteerCenter, { ConnectionStatus } from '../../controller/PuppeteerCenter';
import { Button, Divider, Input, Row, Col, Result } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import './index.less';
import 'codemirror/lib/codemirror.css';
import 'codemirror/lib/codemirror.js';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';

const PREFIX = 'RunUnit';
interface IProps {
  className?: string;
  code: string;
  onContentChange: (value: string) => void;
  onError: (error: any) => void;
}

const RunUnit: React.FC<IProps> = React.memo(function RunUnit(props) {
  const { className, code, onContentChange, onError } = props;
  const [remoteDebuggingPort, setPort] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.unConnection,
  );

  const handleError = useCallback(
    (err) => {
      onError(err);
    },
    [onError],
  );

  const onConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
  }, []);

  const puppeteerCenter = useMemo(() => {
    return new PuppeteerCenter();
  }, []);

  useEffect(() => {
    puppeteerCenter.on('message', handleError);
    puppeteerCenter.on('connectStatus', onConnectionStatus);
    return () => {
      puppeteerCenter.off('message', handleError);
      puppeteerCenter.off('message', onConnectionStatus);
    };
  }, [handleError, onConnectionStatus, puppeteerCenter]);

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
        </div>
        <div>
          <Button onClick={run}>执行</Button>
        </div>
      </div>
    </div>
  );
});

export default RunUnit;
