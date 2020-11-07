export interface layoutPropsFC {
  (arg: any): object;
}

export interface IRoute {
  path: string;
  name?: React.ReactNode;
  layoutProps?: Record<string, any>;
  exact?: boolean;
  // route will cache last actived route by default, ignoreCache will prevent default behavior
  ignoreCache?: boolean;
  component?: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  children?: IRoute[];
  lastChildRoutePath?: string;
}
