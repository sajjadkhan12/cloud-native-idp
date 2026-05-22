import { Fragment, ReactNode } from 'react';
import { Box } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  Content,
  Link,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import {
  EntitySwitch,
  EntityOrphanWarning,
  isOrphan,
  EntityRelationWarning,
  hasRelationWarnings,
  EntityProcessingErrorsPanel,
  hasCatalogProcessingErrors,
} from '@backstage/plugin-catalog';
import type { EntityCardType } from '@backstage/plugin-catalog-react/alpha';
import { useEntityStyles } from './entityStyles';

export type FoundryEntityCard = {
  element: ReactNode;
  type?: EntityCardType;
};

type FoundryEntityContentLayoutProps = {
  cards: FoundryEntityCard[];
};

const CardShell = ({ children }: { children: ReactNode }) => {
  const classes = useEntityStyles();
  return <Box className={classes.cardShell}>{children}</Box>;
};

export const FoundryEntityContentLayout = ({
  cards,
}: FoundryEntityContentLayoutProps) => {
  const classes = useEntityStyles();
  const infoCards = cards.filter(card => card.type === 'info');
  const contentCards = cards.filter(
    card => !card.type || card.type === 'content',
  );

  return (
    <>
      <Box className={classes.warningArea}>
        <EntitySwitch>
          <EntitySwitch.Case if={isOrphan}>
            <EntityOrphanWarning />
          </EntitySwitch.Case>
        </EntitySwitch>
        <EntitySwitch>
          <EntitySwitch.Case if={hasRelationWarnings}>
            <EntityRelationWarning />
          </EntitySwitch.Case>
        </EntitySwitch>
        <EntitySwitch>
          <EntitySwitch.Case if={hasCatalogProcessingErrors}>
            <EntityProcessingErrorsPanel />
          </EntitySwitch.Case>
        </EntitySwitch>
      </Box>

      <Box className={classes.overviewGrid}>
        <Box className={classes.mainColumn}>
          {contentCards.map((card, index) => (
            <CardShell key={card.element?.toString() ?? index}>
              {card.element}
            </CardShell>
          ))}
        </Box>

        {infoCards.length > 0 && (
          <Box className={classes.sideColumn}>
            {infoCards.map((card, index) => (
              <CardShell key={card.element?.toString() ?? index}>
                {card.element}
              </CardShell>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
};

export const FoundryEntityNotFound = ({ kind }: { kind?: string }) => (
  <Content>
    <WarningPanel
      title="Entity not found"
      severity="warning"
    >
      Entity {kind ?? 'item'} not found. See{' '}
      <Link to="https://backstage.io/docs/features/software-catalog/references">
        references
      </Link>{' '}
      for more information on adding entities.
    </WarningPanel>
  </Content>
);

export const FoundryEntityError = ({ error }: { error: Error }) => (
  <Content>
    <Alert severity="error">{error.message}</Alert>
  </Content>
);

export const FoundryEntityLoading = () => <Progress />;
