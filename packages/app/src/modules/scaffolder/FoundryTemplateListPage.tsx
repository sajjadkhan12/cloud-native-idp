import { useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { Box, Button, Card, CardContent, Typography } from '@material-ui/core';
import { ContentHeader, DocsIcon, SupportButton } from '@backstage/core-components';
import { useApp, useRouteRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  CatalogFilterLayout,
  EntityKindPicker,
  EntityListProvider,
  EntityOwnerPicker,
  EntitySearchBar,
  EntityTagPicker,
  UserListPicker,
} from '@backstage/plugin-catalog-react';
import { TemplateCategoryPicker, TemplateGroups } from '@backstage/plugin-scaffolder-react/alpha';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { buildTechDocsURL } from '@backstage/plugin-techdocs-react';
import {
  TECHDOCS_ANNOTATION,
  TECHDOCS_EXTERNAL_ANNOTATION,
} from '@backstage/plugin-techdocs-common';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { usePermission } from '@backstage/plugin-permission-react';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { scaffolderTranslationRef } from '@backstage/plugin-scaffolder/alpha';
import { FoundryTemplateCard } from './FoundryTemplateCard';
import { useScaffolderStyles } from './scaffolderStyles';

export const FoundryTemplateListPage = () => {
  const classes = useScaffolderStyles();
  const registerComponentLink = useRouteRef(
    scaffolderPlugin.externalRoutes.registerComponent,
  );
  const viewTechDocsLink = useRouteRef(
    scaffolderPlugin.externalRoutes.viewTechDoc,
  );
  const templateRoute = useRouteRef(scaffolderPlugin.routes.selectedTemplate);
  const navigate = useNavigate();
  const app = useApp();
  const { t } = useTranslationRef(scaffolderTranslationRef);
  const { allowed: canRegister } = usePermission({
    permission: catalogEntityCreatePermission,
  });

  const groups = [
    {
      title: t('templateListPage.templateGroups.defaultTitle'),
      filter: () => true,
    },
  ];

  const additionalLinksForEntity = useCallback(
    (template: TemplateEntityV1beta3) => {
      if (
        !(
          template.metadata.annotations?.[TECHDOCS_ANNOTATION] ||
          template.metadata.annotations?.[TECHDOCS_EXTERNAL_ANNOTATION]
        ) ||
        !viewTechDocsLink
      ) {
        return [];
      }
      const url = buildTechDocsURL(template, viewTechDocsLink);
      return url
        ? [
            {
              icon: app.getSystemIcon('docs') ?? DocsIcon,
              text: t(
                'templateListPage.additionalLinksForEntity.viewTechDocsTitle',
              ),
              url,
            },
          ]
        : [];
    },
    [app, viewTechDocsLink, t],
  );

  const onTemplateSelected = useCallback(
    (template: TemplateEntityV1beta3) => {
      const { namespace, name } = parseEntityRef(stringifyEntityRef(template));
      navigate(templateRoute({ namespace, templateName: name }));
    },
    [navigate, templateRoute],
  );

  const registerUrl = registerComponentLink?.();

  return (
    <Box className={`${classes.pageRoot} ${classes.shell} foundry-scaffolder`}>
      <Box className={classes.listHeader}>
        <Box className={classes.listHeaderLeft}>
          <Box className={classes.listHeaderIcon}>
            <AddCircleOutlineIcon />
          </Box>
          <Box>
            <Typography className={classes.listTitle}>Create</Typography>
            <Typography className={classes.listSubtitle}>
              Choose a golden path template to scaffold services, libraries, and
              infrastructure into your platform.
            </Typography>
          </Box>
        </Box>
      </Box>

      <EntityListProvider>
        <ContentHeader>
          {registerUrl && canRegister && (
            <Button
              component={RouterLink}
              variant="outlined"
              color="primary"
              to={registerUrl}
            >
              {t('templateListPage.contentHeader.registerExistingButtonTitle')}
            </Button>
          )}
          <SupportButton>
            {t('templateListPage.contentHeader.supportButtonTitle')}
          </SupportButton>
        </ContentHeader>

        <CatalogFilterLayout>
          <CatalogFilterLayout.Filters>
            <Card className={`${classes.filterCard} filterCard`} elevation={0}>
              <CardContent>
                <Typography className={classes.filterTitle}>Filters</Typography>
                <EntitySearchBar />
                <EntityKindPicker initialFilter="template" hidden />
                <UserListPicker
                  initialFilter="all"
                  availableFilters={['all', 'starred']}
                />
                <TemplateCategoryPicker />
                <EntityTagPicker />
                <EntityOwnerPicker />
              </CardContent>
            </Card>
          </CatalogFilterLayout.Filters>
          <CatalogFilterLayout.Content>
            <TemplateGroups
              groups={groups}
              onTemplateSelected={onTemplateSelected}
              additionalLinksForEntity={additionalLinksForEntity}
              TemplateCardComponent={FoundryTemplateCard}
            />
          </CatalogFilterLayout.Content>
        </CatalogFilterLayout>
      </EntityListProvider>
    </Box>
  );
};
