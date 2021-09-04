import React from 'react';
import cls from 'classnames';
import './index.scss';
import RunWindow from './components/RunWindow';

const PREFIX = 'AutoMan';

interface IProps {
  className?: string;
}

const AutoMan: React.FC<IProps> = React.memo(function AutoMan(props) {
  const { className } = props;
  return (
    <div className={cls(`${PREFIX}`, className)}>
      <RunWindow />
    </div>
  );
});

export default AutoMan;
