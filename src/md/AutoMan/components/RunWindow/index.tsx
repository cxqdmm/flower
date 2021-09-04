import React from 'react';
import cls from 'classnames';
import RunUnit from '../RunUnit';

const PREFIX = 'RunWindow';

interface IProps {
  className?: string;
}

const RunWindow: React.FC<IProps> = React.memo(function RunWindow(props) {
  const { className } = props;
  return (
    <div className={cls(`${PREFIX}`, className)}>
      <textarea className={`${PREFIX}-edit`}></textarea>
      <RunUnit />
    </div>
  );
});

export default RunWindow;
