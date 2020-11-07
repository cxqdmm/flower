import React from 'react';
import cls from 'classnames';
import './index.less';
import { IRoute } from '../../router/interface';
import Mavigator from './Navigator';

const PREFIX = 'Layout';

interface IProps {
  title?: React.ReactNode;
  route?: IRoute;
  childRoutes: IRoute[];
}

const Layout: React.FC<IProps> = React.memo(function Layout(props) {
  const { title, childRoutes, children } = props;
  return (
    <div className={cls(`${PREFIX}`)}>
      <div className={`${PREFIX}-head`}>
        <span className={`${PREFIX}-headTitle`}>{title}</span>
      </div>
      <div className={`${PREFIX}-body`}>
        <div className={`${PREFIX}-bodyLeft`}>
          <Mavigator childRoutes={childRoutes} />
        </div>
        <div className={`${PREFIX}-bodyRight`}>{children}</div>
      </div>
    </div>
  );
});

export default Layout;
