import home from '../md/home/index.md';
import ClothView from '../md/cloth';
import { Switch, Redirect, BrowserRouter } from 'react-router-dom';
import { renderRouterWithChildren } from './routeWithLayout';
import Layout from '../components/Layout';
import React from 'react';
import MdView from '../components/MdView';
import { IRoute } from './interface';
import OrientationTransform from '../md/orientationTransform';

const WEB_ROOT = process.env.WEB_ROOT || '/';

function getPath(path: string) {
  return `${WEB_ROOT}${path}`;
}

export const homePath = getPath('/home');
const routes: IRoute[] = [
  {
    path: WEB_ROOT,
    layout: Layout,
    layoutProps: { title: '' },
    ignoreCache: true,
    children: [
      {
        path: homePath,
        name: 'home',
        component: () => <MdView md={home} />,
      },
      {
        path: getPath('/cloth'),
        name: 'cloth',
        component: () => <MdView view={<ClothView />} />,
      },
      {
        path: getPath('/orientation'),
        name: 'Orientation transform',
        component: () => <MdView view={<OrientationTransform />} />,
      },
    ],
  },
];

const RootRouter = () => {
  return (
    <BrowserRouter>
      <Switch>
        {renderRouterWithChildren(undefined, routes)}
        <Redirect to={homePath} />
      </Switch>
    </BrowserRouter>
  );
};

export default RootRouter;
