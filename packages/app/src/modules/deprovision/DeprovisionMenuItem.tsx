import { useState } from 'react';
import { useEntity, catalogApiRef } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi, alertApiRef } from '@backstage/core-plugin-api';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@material-ui/core';

export const DeprovisionMenuItem = () => {
  const { entity } = useEntity();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const configApi = useApi(configApiRef);
  const alertApi = useApi(alertApiRef);
  const catalogApi = useApi(catalogApiRef) as any;

  const handleClose = (e?: any) => {
    if (e) e.stopPropagation();
    if (!loading) setOpen(false);
  };

  const handleDeprovision = async (e: any) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const backendUrl = configApi.getString('backend.baseUrl');
      const serviceName = entity.metadata.name;
      const environment = entity.spec?.lifecycle || 'dev';
      
      const projectSlug = entity.metadata.annotations?.['github.com/project-slug'] || '';
      const [githubOrg] = projectSlug.split('/');

      if (!githubOrg) {
        throw new Error('Could not resolve GitHub Organization from entity annotations (github.com/project-slug)');
      }

      const response = await fetch(`${backendUrl}/api/deprovision/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName,
          githubOrg,
          environment,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to complete deprovisioning');
      }

      const resJson = await response.json();
      
      alertApi.post({
        message: `Deprovisioning successful! Repository deleted. ${resJson.prUrl ? `PR opened: ${resJson.prUrl}` : ''}`,
        severity: 'success',
        display: 'transient',
      });

      // Remove from Backstage Catalog
      if (entity.metadata.uid) {
        await catalogApi.removeEntityByUid(entity.metadata.uid);
      }

      // Redirect to catalog
      window.location.href = '/catalog';
    } catch (err: any) {
      alertApi.post({
        message: `Deprovisioning failed: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const projectSlug = entity.metadata.annotations?.['github.com/project-slug'] || '';

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setOpen(true);
          }
        }}
        style={{ width: '100%', display: 'block', cursor: 'pointer' }}
      >
        Deprovision Service
      </span>

      <Dialog open={open} onClose={(e) => handleClose(e)} onClick={(e) => e.stopPropagation()} aria-labelledby="deprovision-dialog-title">
        <DialogTitle id="deprovision-dialog-title" style={{ color: '#f44336' }}>Confirm Service Deprovisioning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to completely deprovision <strong>{entity.metadata.name}</strong>?
            <br />
            <br />
            This will permanently delete the GitHub repository <strong>{projectSlug || 'N/A'}</strong> and remove it from ArgoCD GitOps. 
            <strong> This action cannot be undone!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => handleClose(e)} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={(e) => handleDeprovision(e)}
            color="secondary"
            variant="contained"
            disabled={loading}
            style={{ backgroundColor: '#f44336', color: '#fff' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
