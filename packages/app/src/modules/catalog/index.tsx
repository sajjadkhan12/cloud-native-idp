import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import CategoryIcon from '@material-ui/icons/Category';

const foundryCatalogPage = PageBlueprint.makeWithOverrides({
  factory(originalFactory) {
    return originalFactory({
      path: '/catalog',
      routeRef: catalogPlugin.routes.catalogIndex,
      title: 'Catalog',
      icon: <CategoryIcon fontSize="inherit" />,
      noHeader: true,
      loader: () =>
        import('./FoundryCatalogPage').then(m => <m.FoundryCatalogPage />),
    });
  },
});

export const catalogModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [foundryCatalogPage],
});
