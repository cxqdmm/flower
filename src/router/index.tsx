import home from '../md/home/index.md';
import { Switch, Redirect, BrowserRouter } from 'react-router-dom';
import { renderRouterWithChildren } from './routeWithLayout';
import Layout from '../components/Layout';
import React from 'react';
import MdView from '../components/MdView';
import { IRoute } from './interface';
import AutoMan from '../md/AutoMan';

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
        path: getPath('/autoMan'),
        name: '自动化执行脚本',
        component: () => <MdView view={<AutoMan />} />,
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
