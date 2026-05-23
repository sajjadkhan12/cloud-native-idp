import { useEffect, useMemo, useState } from 'react';
import { Button } from '@material-ui/core';
import {
  EntityUserFilter,
  starredEntitiesApiRef,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useObservable from 'react-use/esm/useObservable';
import { useScaffolderStyles } from './scaffolderStyles';

type Scope = 'all' | 'starred';

export const TemplateScopeToggle = () => {
  const classes = useScaffolderStyles();
  const { updateFilters } = useEntityList();
  const starredEntitiesApi = useApi(starredEntitiesApiRef);
  const starredEntities = useObservable(
    useMemo(
      () => starredEntitiesApi.starredEntitie$(),
      [starredEntitiesApi],
    ),
    new Set<string>(),
  );
  const [scope, setScope] = useState<Scope>('all');

  useEffect(() => {
    if (scope === 'starred') {
      updateFilters({
        user: EntityUserFilter.starred([...starredEntities]),
      });
      return;
    }
    updateFilters({ user: EntityUserFilter.all() });
  }, [scope, starredEntities, updateFilters]);

  return (
    <div className={classes.scopeToggle} role="group" aria-label="Template scope">
      <Button
        className={scope === 'all' ? classes.scopeToggleActive : undefined}
        onClick={() => setScope('all')}
        aria-pressed={scope === 'all'}
      >
        All
      </Button>
      <Button
        className={scope === 'starred' ? classes.scopeToggleActive : undefined}
        onClick={() => setScope('starred')}
        aria-pressed={scope === 'starred'}
        disabled={starredEntities.size === 0}
      >
        Starred
      </Button>
    </div>
  );
};
