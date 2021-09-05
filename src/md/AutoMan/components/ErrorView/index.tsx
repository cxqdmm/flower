import React from 'react';
import cls from 'classnames';
import './index.less';

const PREFIX = 'Error';

interface IProps {
  className?: string;
  error: any[];
}

const ErrorView: React.FC<IProps> = React.memo(function Error(props) {
  const { className, error } = props;
  return (
    <div className={cls(`${PREFIX}`, className)}>
      {error?.map((item, index) => (
        <div>{item.stack || item}</div>
      ))}
    </div>
  );
});

export default ErrorView;
