import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@material-ui/icons/FlightTakeoff';
import { Box, Typography } from '@material-ui/core';
import { Progress } from '@backstage/core-components';
import {
  AnalyticsContext,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';
import {
  scaffolderApiRef,
  useCustomLayouts,
  useTemplateSecrets,
  FieldExtensionOptions,
} from '@backstage/plugin-scaffolder-react';
import {
  Workflow,
  useTemplateParameterSchema,
} from '@backstage/plugin-scaffolder-react/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { useScaffolderStyles } from './scaffolderStyles';
import { TemplateGuidePanel } from './TemplateGuidePanel';
import { resolveTemplateGuide } from './templateGuideRegistry';

type FoundryTemplateWizardProps = {
  formFields?: FieldExtensionOptions[];
};

export const FoundryTemplateWizard = ({
  formFields = [],
}: FoundryTemplateWizardProps) => {
  const classes = useScaffolderStyles();
  const rootRef = useRouteRef(scaffolderPlugin.routes.root);
  const taskRoute = useRouteRef(scaffolderPlugin.routes.ongoingTask);
  const { secrets: contextSecrets } = useTemplateSecrets();
  const scaffolderApi = useApi(scaffolderApiRef);
  const catalogApi = useApi(catalogApiRef);
  const navigate = useNavigate();
  const customLayouts = useCustomLayouts(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const { templateName, namespace } = useRouteRefParams(
    scaffolderPlugin.routes.selectedTemplate,
  );

  const templateRef = stringifyEntityRef({
    kind: 'Template',
    namespace,
    name: templateName,
  });

  const { manifest } = useTemplateParameterSchema(templateRef);

  const { value: templateEntity } = useAsync(
    () => catalogApi.getEntityByRef({ kind: 'Template', namespace, name: templateName }),
    [catalogApi, namespace, templateName],
  );

  const guideContent = resolveTemplateGuide(templateEntity);
  const guideTitle = templateEntity?.metadata.title ?? manifest?.title ?? templateName;

  const onCreate = useCallback(
    async (initialValues: Record<string, unknown>) => {
      if (isCreating) {
        return;
      }
      setIsCreating(true);
      const { taskId } = await scaffolderApi.scaffold({
        templateRef,
        values: initialValues,
        secrets: contextSecrets,
      });
      navigate(taskRoute({ taskId }));
    },
    [
      contextSecrets,
      isCreating,
      navigate,
      scaffolderApi,
      taskRoute,
      templateRef,
    ],
  );

  const onError = useCallback(
    () => <Navigate to={rootRef()} />,
    [rootRef],
  );

  return (
    <AnalyticsContext attributes={{ entityRef: templateRef }}>
        <Box className={`${classes.pageRoot} ${classes.shell} foundry-scaffolder foundry-scaffolder-wizard`}>
        {isCreating && <Progress />}
        <Box className={classes.wizardHeader}>
          <Box className={classes.wizardIcon}>
            <RocketLaunchIcon />
          </Box>
          <Box>
            <Typography className={classes.wizardTitle}>
              {manifest?.title ?? templateName}
            </Typography>
            {manifest?.description && (
              <Typography className={classes.wizardDescription}>
                {manifest.description}
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={classes.wizardSplit}>
          {guideContent && (
            <Box className={classes.wizardSplitGuide}>
              <TemplateGuidePanel title={guideTitle} content={guideContent} />
            </Box>
          )}
          <Box
            className={
              guideContent ? classes.wizardSplitForm : classes.wizardSplitFormFull
            }
          >
            <Box className={classes.wizardFormPanel}>
              <Workflow
                namespace={namespace}
                templateName={templateName}
                onCreate={onCreate}
                onError={onError}
                extensions={formFields}
                layouts={customLayouts}
                formProps={{
                  noHtml5Validate: true,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </AnalyticsContext>
  );
};
