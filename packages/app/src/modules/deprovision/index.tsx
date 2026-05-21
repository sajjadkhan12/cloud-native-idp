import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityContextMenuItemBlueprint } from '@backstage/plugin-catalog-react/alpha';
import DeleteIcon from '@material-ui/icons/Delete';
import { DeprovisionMenuItem } from './DeprovisionMenuItem';

const deprovisionContextMenuItemExtension = EntityContextMenuItemBlueprint.make({
  name: 'deprovision-context-menu-item',
  params: {
    useProps: () => {
      return {
        title: <DeprovisionMenuItem />,
        onClick: () => {},
      };
    },
    icon: <DeleteIcon />,
    filter: (entity) => {
      return (
        entity.kind === 'Component' &&
        entity.spec?.type === 'service' &&
        !!entity.metadata.annotations?.['github.com/project-slug']
      );
    },
  },
});

export const deprovisionModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [deprovisionContextMenuItemExtension],
});
