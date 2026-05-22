import { ReactNode, useCallback, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  MenuList,
  Popover,
  Tooltip,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CodeIcon from '@material-ui/icons/Code';
import ExtensionIcon from '@material-ui/icons/Extension';
import StorageIcon from '@material-ui/icons/Storage';
import CategoryIcon from '@material-ui/icons/Category';
import {
  FavoriteEntity,
  EntityDisplayName,
  EntityRefLinks,
  getEntityRelations,
  InspectEntityDialog,
  useAsyncEntity,
} from '@backstage/plugin-catalog-react';
import { RELATION_OWNED_BY } from '@backstage/catalog-model';
import { useSearchParams } from 'react-router-dom';
import { EntityContextMenuProvider } from './EntityContextMenuProvider';
import { useEntityStyles } from './entityStyles';

type FoundryEntityHeaderProps = {
  contextMenuItems?: ReactNode;
};

const kindIcon = (kind: string) => {
  switch (kind.toLowerCase()) {
    case 'component':
      return <CodeIcon />;
    case 'api':
      return <ExtensionIcon />;
    case 'resource':
      return <StorageIcon />;
    default:
      return <CategoryIcon />;
  }
};

export const FoundryEntityHeader = ({
  contextMenuItems,
}: FoundryEntityHeaderProps) => {
  const classes = useEntityStyles();
  const { entity } = useAsyncEntity();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedInspectEntityDialogTab = searchParams.get('inspect');
  const inspectDialogOpen = typeof selectedInspectEntityDialogTab === 'string';

  const openInspectEntityDialog = useCallback(
    () => setSearchParams('inspect'),
    [setSearchParams],
  );
  const closeInspectEntityDialog = useCallback(
    () => setSearchParams(),
    [setSearchParams],
  );
  const setInspectEntityDialogTab = useCallback(
    (newTab: string) => setSearchParams(`inspect=${newTab}`),
    [setSearchParams],
  );

  if (!entity) {
    return null;
  }

  const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
  const entityType =
    'type' in (entity.spec ?? {}) ? String(entity.spec?.type ?? '') : '';
  const breadcrumb = `${entity.kind}${entityType ? ` — ${entityType}` : ''}`;
  const description = entity.metadata.description;

  const closeMenu = () => setAnchorEl(undefined);

  return (
    <header className={classes.hero}>
      <Box className={classes.heroDecor}>{kindIcon(entity.kind)}</Box>

      <Box className={classes.heroTopRow}>
        <Box className={classes.heroMain}>
          <Typography className={classes.breadcrumb}>{breadcrumb}</Typography>
          <Box className={classes.titleRow}>
            <Typography component="h1" className={classes.title}>
              <EntityDisplayName entityRef={entity} hideIcon />
            </Typography>
            <FavoriteEntity entity={entity} />
          </Box>
          {description && (
            <Typography className={classes.description}>{description}</Typography>
          )}
        </Box>

        <Box className={classes.heroActions}>
          <Tooltip title="More actions" arrow>
            <IconButton
              className={classes.menuButton}
              aria-label="Entity actions"
              onClick={event => setAnchorEl(event.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ style: { minWidth: 220, borderRadius: 12 } }}
          >
            <MenuList autoFocusItem={Boolean(anchorEl)}>
              {contextMenuItems ? (
                <EntityContextMenuProvider onMenuClose={closeMenu}>
                  {contextMenuItems}
                </EntityContextMenuProvider>
              ) : null}
            </MenuList>
          </Popover>
        </Box>
      </Box>

      <Box className={classes.heroMeta}>
        {ownedByRelations.length > 0 && (
          <Chip
            className={classes.metaChip}
            label={
              <Box display="flex" alignItems="center" component="span">
                <span className={classes.metaChipLabel}>Owner</span>
                <EntityRefLinks
                  entityRefs={ownedByRelations}
                  defaultKind="Group"
                  color="inherit"
                />
              </Box>
            }
          />
        )}
        {entity.spec?.lifecycle && (
          <Chip
            className={classes.metaChip}
            label={
              <Box display="flex" alignItems="center" component="span">
                <span className={classes.metaChipLabel}>Lifecycle</span>
                {String(entity.spec.lifecycle)}
              </Box>
            }
          />
        )}
        {entity.metadata.tags?.slice(0, 3).map(tag => (
          <Chip key={tag} className={classes.metaChip} label={tag} />
        ))}
      </Box>

      <InspectEntityDialog
        entity={entity}
        initialTab={selectedInspectEntityDialogTab || undefined}
        open={inspectDialogOpen}
        onClose={closeInspectEntityDialog}
        onSelect={setInspectEntityDialogTab}
      />
    </header>
  );
};
