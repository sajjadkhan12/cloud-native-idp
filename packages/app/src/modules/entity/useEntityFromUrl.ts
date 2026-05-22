import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import {
  catalogApiRef,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { errorApiRef, useApi, useRouteRefParams } from '@backstage/core-plugin-api';

export const useEntityFromUrl = () => {
  const { kind, namespace, name } = useRouteRefParams(entityRouteRef);
  const navigate = useNavigate();
  const errorApi = useApi(errorApiRef);
  const catalogApi = useApi(catalogApiRef);

  const {
    value: entity,
    error,
    loading,
    retry: refresh,
  } = useAsyncRetry(
    () => catalogApi.getEntityByRef({ kind, namespace, name }),
    [catalogApi, kind, namespace, name],
  );

  useEffect(() => {
    if (!name) {
      errorApi.post(new Error('No name provided!'));
      navigate('/');
    }
  }, [errorApi, navigate, name]);

  return { entity, loading, error, refresh };
};
