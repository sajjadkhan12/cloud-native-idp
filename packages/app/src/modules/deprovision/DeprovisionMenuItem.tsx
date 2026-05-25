import { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi, alertApiRef } from '@backstage/core-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@material-ui/core';

type DeprovisionResourceType = 'service' | 's3-bucket';

function getResourceType(entity: ReturnType<typeof useEntity>['entity']): DeprovisionResourceType | null {
  if (
    entity.kind === 'Component' &&
    entity.spec?.type === 'service' &&
    entity.metadata.annotations?.['github.com/project-slug']
  ) {
    return 'service';
  }

  if (entity.kind === 'Resource' && entity.spec?.type === 's3-bucket') {
    return 's3-bucket';
  }

  return null;
}

export const DeprovisionMenuItem = () => {
  const { entity } = useEntity();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const configApi = useApi(configApiRef);
  const alertApi = useApi(alertApiRef);

  const resourceType = getResourceType(entity);
  const isS3Bucket = resourceType === 's3-bucket';

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!loading) setOpen(false);
  };

  const handleDeprovision = async (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const backendUrl = configApi.getString('backend.baseUrl');
      const entityRef = stringifyEntityRef(entity);
      const entityUid = entity.metadata.uid;

      let body: Record<string, string | undefined>;

      if (isS3Bucket) {
        const teamId =
          entity.metadata.annotations?.['foundry.io/terraform-team'] ||
          entity.spec?.system?.toString().replace(/-infrastructure$/, '');

        if (!teamId) {
          throw new Error(
            'Could not resolve Terraform team from entity annotations (foundry.io/terraform-team)',
          );
        }

        body = {
          resourceType: 's3-bucket',
          bucketName: entity.metadata.name,
          teamId,
          entityRef,
          entityUid,
        };
      } else {
        const serviceName = entity.metadata.name;
        const environment = entity.spec?.lifecycle?.toString() || 'dev';
        const projectSlug =
          entity.metadata.annotations?.['github.com/project-slug'] || '';
        const [githubOrg] = projectSlug.split('/');

        if (!githubOrg) {
          throw new Error(
            'Could not resolve GitHub Organization from entity annotations (github.com/project-slug)',
          );
        }

        body = {
          resourceType: 'service',
          serviceName,
          githubOrg,
          environment,
          entityRef,
          entityUid,
        };
      }

      const response = await fetch(`${backendUrl}/api/deprovision/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to complete deprovisioning');
      }

      const resJson = await response.json();

      alertApi.post({
        message: `Deprovisioning successful! ${resJson.message}${resJson.prUrl ? ` PR: ${resJson.prUrl}` : ''}`,
        severity: 'success',
        display: 'transient',
      });

      window.location.href = '/catalog';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alertApi.post({
        message: `Deprovisioning failed: ${message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const projectSlug =
    entity.metadata.annotations?.['github.com/project-slug'] || '';
  const terraformRepo =
    entity.metadata.annotations?.['foundry.io/terraform-repo'] ||
    'sajjadkhan-academy/backstage-terraform';

  const menuLabel = isS3Bucket ? 'Deprovision Bucket' : 'Deprovision Service';
  const dialogTitle = isS3Bucket
    ? 'Confirm S3 Bucket Deprovisioning'
    : 'Confirm Service Deprovisioning';

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setOpen(true);
          }
        }}
        style={{ width: '100%', display: 'block', cursor: 'pointer' }}
      >
        {menuLabel}
      </span>

      <Dialog
        open={open}
        onClose={e => handleClose(e)}
        onClick={e => e.stopPropagation()}
        aria-labelledby="deprovision-dialog-title"
      >
        <DialogTitle
          id="deprovision-dialog-title"
          style={{ color: '#f44336' }}
        >
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to completely deprovision{' '}
            <strong>{entity.metadata.name}</strong>?
            <br />
            <br />
            {isS3Bucket ? (
              <>
                This will remove the bucket from the Backstage catalog and open
                a Pull Request in <strong>{terraformRepo}</strong> to delete
                its Terraform configuration. After the PR is merged, HCP Terraform
                will destroy the bucket in AWS.
                <br />
                <br />
                <strong>Empty the bucket in AWS before merging the PR.</strong>
              </>
            ) : (
              <>
                This will remove the service from the Backstage catalog,
                permanently delete the GitHub repository{' '}
                <strong>{projectSlug || 'N/A'}</strong>, and remove it from
                ArgoCD GitOps.
              </>
            )}
            <br />
            <br />
            <strong>This action cannot be undone!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={e => handleClose(e)} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={e => handleDeprovision(e)}
            color="secondary"
            variant="contained"
            disabled={loading}
            style={{ backgroundColor: '#f44336', color: '#fff' }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
