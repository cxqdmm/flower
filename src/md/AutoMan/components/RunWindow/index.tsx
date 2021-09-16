import React, { useCallback, useState } from 'react';
import cls from 'classnames';
import RunUnit from '../RunUnit';
import Code from '../Code';
import './index.less';
import { Button } from 'antd';
const PREFIX = 'RunWindow';
interface IProps {
  className?: string;
}

const RunWindow: React.FC<IProps> = React.memo(function RunWindow(props) {
  const { className } = props;
  const [content, setCode] = useState<string>('');
  const [log, setLog] = useState<string>('');
  const onContentChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleLog = (msg: any) => {
    setLog((msgs) => {
      return msgs + msg + '\r\n';
    });
  };
  const clearError = () => {
    setLog('');
  };
  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div className={`${PREFIX}-top`}>
        <RunUnit code={content} onContentChange={onContentChange} onLog={handleLog} />
      </div>
      <div className={`${PREFIX}-bottom`}>
        <Code
          className={`${PREFIX}-bottomBody`}
          value={log}
          controlled={false}
          options={{
            readOnly: 'nocursor',
          }}
          scrollToBottomWhenChange={true}
        />
        <div className={`${PREFIX}-bottomFooter`}>
          <Button type="default" onClick={clearError}>
            清空
          </Button>
        </div>
      </div>
    </div>
  );
});

export default RunWindow;
