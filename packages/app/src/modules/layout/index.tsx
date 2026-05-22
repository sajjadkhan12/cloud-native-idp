import { PageLayout } from '@backstage/frontend-plugin-api';
import { SwappableComponentBlueprint } from '@backstage/plugin-app-react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

const foundryPageLayout = SwappableComponentBlueprint.makeWithOverrides({
  name: 'core-page-layout',
  factory(originalFactory) {
    return originalFactory((define) =>
      define({
        component: PageLayout,
        loader: () =>
          import('./FoundryPageLayout').then(m => m.FoundryPageLayout),
      }),
    );
  },
});

export const layoutModule = createFrontendModule({
  pluginId: 'app',
  extensions: [foundryPageLayout],
});
