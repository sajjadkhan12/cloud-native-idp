import { jsx } from 'react/jsx-runtime';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import {
  PageBlueprint,
  coreExtensionData,
  createExtensionInput,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import {
  AsyncEntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import {
  EntityContextMenuItemBlueprint,
  EntityContentBlueprint,
  EntityContentLayoutBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { buildFilterFn } from './buildFilterFn';
import { useEntityFromUrl } from './useEntityFromUrl';

const foundryEntityPage = PageBlueprint.makeWithOverrides({
  name: 'entity',
  inputs: {
    contents: createExtensionInput([
      coreExtensionData.reactElement,
      coreExtensionData.routePath,
      coreExtensionData.routeRef.optional(),
      EntityContentBlueprint.dataRefs.title,
      EntityContentBlueprint.dataRefs.filterFunction.optional(),
      EntityContentBlueprint.dataRefs.filterExpression.optional(),
      EntityContentBlueprint.dataRefs.group.optional(),
    ]),
    contextMenuItems: createExtensionInput([
      coreExtensionData.reactElement,
      EntityContextMenuItemBlueprint.dataRefs.filterFunction.optional(),
    ]),
  },
  factory(originalFactory, { inputs }) {
    return originalFactory({
      path: '/catalog/:namespace/:kind/:name',
      noHeader: true,
      title: 'Catalog Entity',
      routeRef: convertLegacyRouteRef(entityRouteRef),
      loader: async () => {
        const { FoundryEntityLayout } = await import('./FoundryEntityLayout');

        const menuItems = (inputs.contextMenuItems ?? []).map(item => ({
          element: item.get(coreExtensionData.reactElement),
          filter:
            item.get(EntityContextMenuItemBlueprint.dataRefs.filterFunction) ??
            (() => true),
        }));

        const Component = () => {
          const entityFromUrl = useEntityFromUrl();
          const { entity } = entityFromUrl;

          const filteredMenuItems = entity
            ? menuItems.filter(item => item.filter(entity)).map(item => item.element)
            : [];

          return jsx(AsyncEntityProvider, {
            ...entityFromUrl,
            children: jsx(FoundryEntityLayout, {
              contextMenuItems: filteredMenuItems,
              children: (inputs.contents ?? []).map(output =>
                jsx(
                  FoundryEntityLayout.Route,
                  {
                    group: output.get(EntityContentBlueprint.dataRefs.group),
                    path: output.get(coreExtensionData.routePath),
                    title: output.get(EntityContentBlueprint.dataRefs.title),
                    if: buildFilterFn(
                      output.get(
                        EntityContentBlueprint.dataRefs.filterFunction,
                      ),
                      output.get(
                        EntityContentBlueprint.dataRefs.filterExpression,
                      ),
                    ),
                    children: output.get(coreExtensionData.reactElement),
                  },
                  output.get(coreExtensionData.routePath),
                ),
              ),
            }),
          });
        };

        return jsx(Component, {});
      },
    });
  },
});

const foundryEntityContentLayout = EntityContentLayoutBlueprint.make({
  name: 'foundry',
  params: {
    loader: async () => {
      const { FoundryEntityContentLayout } = await import(
        './FoundryEntityContentLayout'
      );
      return FoundryEntityContentLayout;
    },
  },
});

export const entityModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [foundryEntityPage, foundryEntityContentLayout],
});
