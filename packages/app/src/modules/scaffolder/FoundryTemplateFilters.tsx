import { Box } from '@material-ui/core';
import {
  EntityKindPicker,
  EntityOwnerPicker,
  EntitySearchBar,
  EntityTagPicker,
} from '@backstage/plugin-catalog-react';
import { TemplateCategoryPicker } from '@backstage/plugin-scaffolder-react/alpha';
import { TemplateScopeToggle } from './TemplateScopeToggle';
import { useScaffolderStyles } from './scaffolderStyles';

export const FoundryTemplateFilters = () => {
  const classes = useScaffolderStyles();

  return (
    <Box className={`${classes.filterToolbar} ${classes.filterToolbarShell}`}>
      <EntityKindPicker initialFilter="template" hidden />

      <Box className={classes.filterRowPrimary}>
        <Box className={classes.filterSearchWrap}>
          <EntitySearchBar />
        </Box>
        <TemplateScopeToggle />
      </Box>

      <Box className={classes.filterRowSecondary}>
        <Box className={classes.filterSelectWrap}>
          <TemplateCategoryPicker />
        </Box>
        <Box className={classes.filterSelectWrap}>
          <EntityTagPicker />
        </Box>
        <Box className={classes.filterSelectWrap}>
          <EntityOwnerPicker />
        </Box>
      </Box>
    </Box>
  );
};
