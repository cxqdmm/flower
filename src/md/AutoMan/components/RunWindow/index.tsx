import React, { useCallback, useState } from 'react';
import cls from 'classnames';
import RunUnit from '../RunUnit';
import ErrorView from '../ErrorView';
import './index.less';
import { Button } from 'antd';
const PREFIX = 'RunWindow';
interface IProps {
  className?: string;
}

const RunWindow: React.FC<IProps> = React.memo(function RunWindow(props) {
  const { className } = props;
  const [content, setCode] = useState<string>('');
  const [logList, setLogList] = useState<string>('');
  const onContentChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleLog = (msg: any) => {
    setLogList((msgs) => {
      return msgs + msg + '\r\n';
    });
  };
  const clearError = () => {
    setLogList('');
  };
  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div className={`${PREFIX}-top`}>
        <RunUnit code={content} onContentChange={onContentChange} onLog={handleLog} />
      </div>
      <div className={`${PREFIX}-bottom`}>
        <ErrorView className={`${PREFIX}-bottomLeft`} error={logList} />
        <div className={`${PREFIX}-bottomRight`}>
          <Button onClick={clearError}>清空</Button>
        </div>
      </div>
    </div>
  );
});

export default RunWindow;
