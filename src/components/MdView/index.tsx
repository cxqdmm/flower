import React from 'react';
import cls from 'classnames';
import './index.less';

const PREFIX = 'MdView';

interface IProps {
  className?: string;
  md: string;
  view?: React.ReactNode;
}

const MdView: React.FC<IProps> = React.memo(function MdView(props) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const { className, md, view } = props;
  return (
    <div className={cls(`${PREFIX}`, className)}>
      {isDevelopment && view && <div className={`${PREFIX}-body`}>{view}</div>}
      <div className={`${PREFIX}-md`} dangerouslySetInnerHTML={{ __html: md }}></div>
    </div>
  );
});

export default MdView;
