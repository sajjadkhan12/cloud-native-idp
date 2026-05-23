import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import githubActionsPlugin from '@backstage-community/plugin-github-actions/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import { navModule } from './modules/nav';
import { deprovisionModule } from './modules/deprovision';
import { homeModule } from './modules/home';
import { catalogModule } from './modules/catalog';
import { scaffolderModule } from './modules/scaffolder';
import { layoutModule } from './modules/layout';
import { entityModule } from './modules/entity';
import { scorecardsPlugin } from './modules/scorecards';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';

import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
        <SignInPage
          {...props}
          providers={[
            'guest',
            {
              id: 'github-auth-provider',
              title: 'GitHub',
              message: 'Sign in using GitHub',
              apiRef: githubAuthApiRef,
            },
          ]}
        />
      ),
  },
});

export default createApp({
  features: [
    catalogPlugin,
    catalogModule,
    scaffolderPlugin,
    scaffolderModule,
    githubActionsPlugin,
    techdocsPlugin,
    apiDocsPlugin,
    catalogGraphPlugin,
    navModule,
    homeModule,
    layoutModule,
    entityModule,
    deprovisionModule,
    scorecardsPlugin,
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage],
    })
  ],
});
