import { Box, Button, Chip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CategoryIcon from '@material-ui/icons/Category';
import { Content, Link, Page } from '@backstage/core-components';
import {
  CatalogFilterLayout,
  EntityListProvider,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { CatalogTable } from '@backstage/plugin-catalog';
import { useApi } from '@backstage/core-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { useCatalogStyles } from './catalogStyles';
import { FoundryCatalogFilters } from './FoundryCatalogFilters';
import { foundryCatalogColumns } from './foundryCatalogColumns';

const CatalogHeader = () => {
  const classes = useCatalogStyles();
  const configApi = useApi(configApiRef);
  const orgName = configApi.getOptionalString('organization.name') ?? 'Foundry IDP';
  const { totalItems, loading } = useEntityList();
  const { allowed } = usePermission({ permission: catalogEntityCreatePermission });

  return (
    <Box className={classes.header}>
      <Box className={classes.headerLeft}>
        <Box className={classes.headerIcon}>
          <CategoryIcon />
        </Box>
        <Box>
          <Typography className={classes.title}>{orgName} Catalog</Typography>
          <Typography className={classes.subtitle}>
            Browse, filter, and manage all software in your developer portal.
          </Typography>
          <Box className={classes.stats}>
            <Chip
              className={classes.statChip}
              label={loading ? 'Loading...' : `${totalItems ?? 0} entities`}
              size="small"
            />
          </Box>
        </Box>
      </Box>
      {allowed && (
        <Button
          className={classes.createButton}
          component={Link}
          to="/create"
          startIcon={<AddIcon />}
        >
          Create
        </Button>
      )}
    </Box>
  );
};

const CatalogBody = () => {
  const classes = useCatalogStyles();

  return (
    <Box className={classes.layout}>
      <CatalogFilterLayout>
        <CatalogFilterLayout.Filters>
          <FoundryCatalogFilters
            initialKind="component"
            initiallySelectedFilter="owned"
          />
        </CatalogFilterLayout.Filters>
        <CatalogFilterLayout.Content>
          <Box className={`${classes.tableCard} ${classes.tableShell}`}>
            <CatalogTable
              columns={foundryCatalogColumns}
              tableOptions={{
                padding: 'default',
                search: true,
                paging: true,
                pageSize: 10,
              }}
            />
          </Box>
        </CatalogFilterLayout.Content>
      </CatalogFilterLayout>
    </Box>
  );
};

export const FoundryCatalogPage = () => {
  const classes = useCatalogStyles();

  return (
    <Page themeId="catalog">
      <Content className={classes.root}>
        <EntityListProvider pagination>
          <CatalogHeader />
          <CatalogBody />
        </EntityListProvider>
      </Content>
    </Page>
  );
};
