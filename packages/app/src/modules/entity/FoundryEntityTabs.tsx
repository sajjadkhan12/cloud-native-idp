import { ReactNode, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { NavLink, matchRoutes, useParams, useRoutes } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { useEntityStyles } from './entityStyles';

export type FoundryEntityTabRoute = {
  path: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

const useSelectedSubRoute = (subRoutes: FoundryEntityTabRoute[]) => {
  const params = useParams();
  const routes = subRoutes.map(({ path, children }) => ({
    caseSensitive: false,
    path: `${path}/*`,
    element: children,
  }));
  const sortedRoutes = routes.sort((a, b) =>
    b.path.replace(/\/\*$/, '').localeCompare(a.path.replace(/\/\*$/, '')),
  );
  const element = useRoutes(sortedRoutes) ?? subRoutes[0]?.children;

  let currentRoute = params['*'] ?? '';
  if (!currentRoute.startsWith('/')) {
    currentRoute = `/${currentRoute}`;
  }

  const [matchedRoute] = matchRoutes(sortedRoutes, currentRoute) ?? [];
  const foundIndex = matchedRoute
    ? subRoutes.findIndex(t => `${t.path}/*` === matchedRoute.route.path)
    : 0;

  return {
    index: foundIndex === -1 ? 0 : foundIndex,
    element,
    route: subRoutes[foundIndex] ?? subRoutes[0],
  };
};

type FoundryEntityTabsProps = {
  routes: FoundryEntityTabRoute[];
};

export const FoundryEntityTabs = ({ routes }: FoundryEntityTabsProps) => {
  const classes = useEntityStyles();
  const { index, route, element } = useSelectedSubRoute(routes);

  const tabs = useMemo(
    () =>
      routes.map(tab => {
        let to = tab.path.replace(/\/\*$/, '').replace(/^\//, '');
        return {
          id: tab.path,
          to,
          label: tab.title,
          icon: tab.icon,
        };
      }),
    [routes],
  );

  if (routes.length === 0) {
    return null;
  }

  return (
    <>
      <Box className={classes.tabBar}>
        <nav className={classes.tabNav} aria-label="Entity sections">
          {tabs.map((tab, tabIndex) => {
            const active = tabIndex === index;
            return (
              <NavLink
                key={tab.id}
                to={tab.to}
                end={tab.to === ''}
                className={`${classes.tab} ${active ? classes.tabActive : ''}`}
              >
                {tab.icon}
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </Box>
      <Box component="main" className={classes.content}>
        <Helmet title={route?.title} />
        {element}
      </Box>
    </>
  );
};
