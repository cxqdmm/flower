/**
 *  自动化脚本执行单元
 */
import React, { useCallback, useEffect, useState } from 'react';
import cls from 'classnames';
import PuppeteerCenter, { ConnectionStatus } from '../../controller/PuppeteerCenter';
import { Input, Button } from 'antd';
import './index.less';
const PREFIX = 'RunUnit';
interface IProps {
  className?: string;
  code: string;
  onContentChange: (value: string) => void;
  onError: (error: any) => void;
}

const RunUnit: React.FC<IProps> = React.memo(function RunUnit(props) {
  const { className, code, onContentChange, onError } = props;
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.unConnection,
  );
  const [puppeteerCenter, setPuppeteerCenter] = useState<PuppeteerCenter>();

  const handleError = useCallback(
    (err) => {
      onError(err);
    },
    [onError],
  );

  const onConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
  }, []);

  useEffect(() => {
    const puppeteerCenter = new PuppeteerCenter();
    puppeteerCenter.on('error', handleError);
    puppeteerCenter.on('connectStatus', onConnectionStatus);
    setPuppeteerCenter(puppeteerCenter);
  }, [handleError, onConnectionStatus, onError]);

  const connect = useCallback(async () => {
    await puppeteerCenter?.connect(9222);
  }, [puppeteerCenter]);

  const run = useCallback(async () => {
    puppeteerCenter?.runScript(code);
  }, [code, puppeteerCenter]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div className={`${PREFIX}-left`}>
        <Input.TextArea value={code} onChange={onChange}></Input.TextArea>
      </div>
      <div className={`${PREFIX}-right`}>
        <Button onClick={connect}>连接</Button>
        <div>连接状态：{connectionStatus}</div>
        <Button onClick={run}>执行</Button>
      </div>
    </div>
  );
});

export default RunUnit;
