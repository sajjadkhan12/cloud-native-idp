import { Box, Card, CardContent, Typography } from '@material-ui/core';
import {
  EntityKindPicker,
  EntityTypePicker,
  UserListFilterKind,
  UserListPicker,
} from '@backstage/plugin-catalog-react';
import { useCatalogStyles } from './catalogStyles';

type FoundryCatalogFiltersProps = {
  initialKind?: string;
  initiallySelectedFilter?: UserListFilterKind;
};

export const FoundryCatalogFilters = ({
  initialKind = 'component',
  initiallySelectedFilter = 'owned',
}: FoundryCatalogFiltersProps) => {
  const classes = useCatalogStyles();

  return (
    <Card className={classes.filterCard} elevation={0}>
      <CardContent className={classes.filterCardContent}>
        <Typography className={classes.filterTitle}>Filters</Typography>

        <Box className={classes.filtersShell}>
          <Box className={classes.filterSection}>
            <Typography className={classes.filterSectionLabel}>Entity</Typography>
            <EntityKindPicker initialFilter={initialKind} />
            <EntityTypePicker />
          </Box>

          <Box className={classes.filterSection}>
            <UserListPicker initialFilter={initiallySelectedFilter} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
