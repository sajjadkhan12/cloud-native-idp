import { ReactNode } from 'react';
import Alert from '@material-ui/lab/Alert';
import {
  attachComponentData,
  useElementFilter,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { Content, Progress } from '@backstage/core-components';
import { entityRouteRef, useAsyncEntity } from '@backstage/plugin-catalog-react';
import { FoundryEntityHeader } from './FoundryEntityHeader';
import { FoundryEntityTabs, FoundryEntityTabRoute } from './FoundryEntityTabs';
import { FoundryEntityNotFound } from './FoundryEntityContentLayout';
import { useEntityStyles } from './entityStyles';

const dataKey = 'plugin.catalog.entityLayoutRoute';

const Route = () => null;
attachComponentData(Route, dataKey, true);
attachComponentData(Route, 'core.gatherMountPoints', true);

type FoundryEntityLayoutProps = {
  contextMenuItems?: ReactNode;
  children?: ReactNode;
};

export const FoundryEntityLayout = ({
  contextMenuItems,
  children,
}: FoundryEntityLayoutProps) => {
  const classes = useEntityStyles();
  const { kind } = useRouteRefParams(entityRouteRef);
  const { entity, loading, error } = useAsyncEntity();

  const routes = useElementFilter(
    children,
    elements =>
      elements
        .selectByComponentData({
          key: dataKey,
          withStrictError: 'Child of EntityLayout must be an EntityLayout.Route',
        })
        .getElements()
        .flatMap(({ props: elementProps }) => {
          if (!entity) {
            return [];
          }
          if (elementProps.if && !elementProps.if(entity)) {
            return [];
          }
          return [
            {
              path: elementProps.path as string,
              title: elementProps.title as string,
              icon: elementProps.icon as ReactNode,
              children: elementProps.children as ReactNode,
            } satisfies FoundryEntityTabRoute,
          ];
        }),
    [entity],
  );

  return (
    <div className={classes.pageRoot}>
      <FoundryEntityHeader contextMenuItems={contextMenuItems} />

      {loading && (
        <Content>
          <Progress />
        </Content>
      )}

      {entity && routes.length > 0 && <FoundryEntityTabs routes={routes} />}

      {error && (
        <Content>
          <Alert severity="error">{error.message}</Alert>
        </Content>
      )}

      {!loading && !error && !entity && <FoundryEntityNotFound kind={kind} />}
    </div>
  );
};

FoundryEntityLayout.Route = Route;
