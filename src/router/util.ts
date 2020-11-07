import { IRoute } from './interface';
import { find } from 'lodash';

export const recoverPath: (currentRoute?: IRoute, childRoutes?: IRoute[]) => string = (
  currentRoute,
  childRoutes,
) => {
  if (currentRoute && childRoutes?.length) {
    const matchedChildRoute = find(
      childRoutes,
      (route) => route.path === currentRoute?.lastChildRoutePath,
    );

    const nextRoute = matchedChildRoute || childRoutes[0];
    return recoverPath(nextRoute, nextRoute.children);
  }
  return currentRoute?.path || '';
};
