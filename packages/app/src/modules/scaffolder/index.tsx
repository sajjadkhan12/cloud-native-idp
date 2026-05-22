import { jsx } from 'react/jsx-runtime';
import {
  createFrontendModule,
  PageBlueprint,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import scaffolderPlugin, { formFieldsApiRef } from '@backstage/plugin-scaffolder/alpha';

const foundryScaffolderPage = PageBlueprint.makeWithOverrides({
  factory(originalFactory) {
    return originalFactory({
      path: '/create',
      routeRef: scaffolderPlugin.routes.root,
      title: 'Create',
      noHeader: true,
    });
  },
});

const foundryTemplatesSubPage = SubPageBlueprint.makeWithOverrides({
  name: 'templates',
  factory(originalFactory, { apis }) {
    const formFieldsApi = apis.get(formFieldsApiRef);
    return originalFactory({
      path: 'templates',
      title: 'Templates',
      loader: async () => {
        const formFields = (await formFieldsApi?.loadFormFields()) ?? [];
        const { FoundryTemplatesSubPage } = await import('./FoundryTemplatesSubPage');
        return jsx(FoundryTemplatesSubPage, { formFields });
      },
    });
  },
});

export const scaffolderModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [foundryScaffolderPage, foundryTemplatesSubPage],
});
