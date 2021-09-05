import React, { useCallback, useState } from 'react';
import cls from 'classnames';
import RunUnit from '../RunUnit';
import ErrorView from '../ErrorView';
import './index.less';
const PREFIX = 'RunWindow';

interface IProps {
  className?: string;
}

const RunWindow: React.FC<IProps> = React.memo(function RunWindow(props) {
  const { className } = props;
  const [content, setCode] = useState<string>('');
  const [errorList, setErrorList] = useState<any[]>([]);
  const onContentChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleError = (error: any) => {
    setErrorList((errList) => [...errorList, error]);
  };
  return (
    <div className={cls(`${PREFIX}`, className)}>
      <div className={`${PREFIX}-top`}>
        <RunUnit code={content} onContentChange={onContentChange} onError={handleError} />
      </div>
      <div className={`${PREFIX}-bottom`}>
        <ErrorView error={errorList} />
      </div>
    </div>
  );
});

export default RunWindow;
