import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import { FoundrySidebarTheme } from './FoundrySidebarTheme';
import HomeIcon from '@material-ui/icons/Home';
import CategoryIcon from '@material-ui/icons/Category';
import SearchIcon from '@material-ui/icons/Search';
import { SidebarSearchModal } from '@backstage/plugin-search';
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));

      nav.take('page:search');
      nav.take('page:app/home');
      nav.take('page:user-settings');

      return (
        <FoundrySidebarTheme>
          <Sidebar>
            <SidebarLogo />
            <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
              <SidebarSearchModal />
            </SidebarGroup>
            <SidebarDivider />
            <SidebarItem icon={HomeIcon} to="/" text="Home" />
            {nav.take('page:catalog') ?? (
              <SidebarItem icon={CategoryIcon} to="/catalog" text="Catalog" />
            )}
            {nav.take('page:scaffolder')}
            <SidebarDivider />
            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
            </SidebarScrollWrapper>
            <SidebarSpace />
            <SidebarDivider />
            <NotificationsSidebarItem />
          </Sidebar>
        </FoundrySidebarTheme>
      );
    },
  },
});
