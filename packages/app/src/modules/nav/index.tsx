import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { AppRootWrapperBlueprint } from '@backstage/plugin-app-react';
import { SidebarContent } from './Sidebar';
import { AppShellWrapper } from './TopBar';

const appShellWrapper = AppRootWrapperBlueprint.make({
  name: 'foundry-shell',
  params: {
    component: AppShellWrapper,
  },
});

export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [SidebarContent, appShellWrapper],
});
