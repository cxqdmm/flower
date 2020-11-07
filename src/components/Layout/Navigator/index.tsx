import { Link } from 'react-router-dom';
import { find } from 'lodash';
import { useLocation } from 'react-router';
import React, { useMemo } from 'react';
import cls from 'classnames';
import './index.less';
import { IRoute } from '../../../router/interface';

const PREFIX = 'Mavigator';

interface IProps {
  className?: string;
  childRoutes: IRoute[];
}

const useRouterPathMatch = (routers: IRoute[]) => {
  const location = useLocation();
  const router = useMemo(() => {
    return find(routers, (router) => location.pathname.includes(router.path));
  }, [location.pathname, routers]);
  return router?.path;
};

const Mavigator: React.FC<IProps> = React.memo(function AppThirdNavigator(props) {
  const { className, childRoutes } = props;
  const matchedPath = useRouterPathMatch(childRoutes);

  return (
    <div className={cls(`${PREFIX}`, className)}>
      {childRoutes.map((router) =>
        matchedPath === router.path ? (
          <span className={cls(`${PREFIX}-item`, 'is-active')}>
            {router.name}
            <div className={`${PREFIX}-activeBar`} />
          </span>
        ) : (
          <Link className={cls(`${PREFIX}-item`)} key={router.path} to={router.path}>
            {router.name}
            <div className={`${PREFIX}-activeBar`} />
          </Link>
        ),
      )}
    </div>
  );
});

export default Mavigator;
