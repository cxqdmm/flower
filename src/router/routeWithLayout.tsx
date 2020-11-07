import { IRoute } from './interface';
import { Redirect, Route, RouteComponentProps, RouteProps, Switch } from 'react-router-dom';
import { map } from 'lodash';
import { recoverPath } from './util';
import React from 'react';
import { homePath } from '.';

type IRouteWithLayoutProps = Omit<RouteProps, 'component' | 'render' | 'children'> & {
  childrenRender: React.ReactNode;
  childRoutes?: IRoute[];
  parentRoute?: IRoute;
  route?: IRoute;
} & Partial<IRoute>;

const RedirectRoute: React.FC<
  Partial<RouteComponentProps> & {
    routes?: IRoute[];
    route?: IRoute;
  }
> = React.memo(function ({ route, routes, location }) {
  const { pathname } = location || {};
  const redirectUrl = recoverPath(route, routes);
  if (redirectUrl !== pathname) {
    return <Redirect to={redirectUrl || homePath} />;
  }
  return <Redirect to={homePath} />;
});

export const renderRouterWithChildren = (
  route: IRoute | undefined,
  children?: IRoute[],
  parentRoute?: IRoute,
) => {
  const childrenRender = children ? (
    <Switch>
      {map(children, (child, index) => {
        return renderRouterWithChildren(child, child.children, route);
      })}
      <RedirectRoute routes={children} route={route} />
    </Switch>
  ) : null;

  return (
    <CustomerRoute
      childrenRender={childrenRender}
      {...route}
      route={route}
      parentRoute={parentRoute}
      childRoutes={children}
    />
  );
};

const CustomerRoute: React.FC<IRouteWithLayoutProps> = React.memo(function CustomerRoute(props) {
  const {
    childrenRender,
    route,
    parentRoute,
    childRoutes,
    layout: Layout,
    layoutProps,
    children,
    component: RouterComponent,
    ...restProps
  } = props;

  if (parentRoute && !parentRoute.ignoreCache) {
    parentRoute.lastChildRoutePath = route?.path;
  }
  if (!route) {
    return childrenRender as React.ReactElement;
  }

  if (!childRoutes) {
    if (RouterComponent) {
      if (Layout) {
        return (
          <PrivateRoute
            {...restProps}
            render={() => (
              <Layout route={route} {...layoutProps}>
                <RouterComponent {...restProps} />
              </Layout>
            )}
          />
        );
      }
      return <PrivateRoute {...restProps} render={() => <RouterComponent {...restProps} />} />;
    }
  }

  if (childRoutes) {
    if (Layout) {
      return (
        <PrivateRoute
          {...restProps}
          render={() => (
            <Layout childRoutes={childRoutes} route={route} {...layoutProps}>
              {childrenRender}
            </Layout>
          )}
        />
      );
    }
  }
  return childrenRender as React.ReactElement;
});
type PrivateRouteProps = Required<Pick<RouteProps, 'render'>> &
  Omit<RouteProps, 'component' | 'render'>;
export const PrivateRoute = ({ render, ...rest }: PrivateRouteProps) => {
  return <Route {...rest} render={render} />;
};
