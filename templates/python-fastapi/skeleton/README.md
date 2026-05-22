# ${{ values.service_name }}

${{ values.description }}

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port ${{ values.service_port }} --reload
```

Health endpoint:

```bash
curl http://localhost:${{ values.service_port }}/health
```

## CI/CD and GitOps

On every push to `${{ values.git_branch }}`, GitHub Actions:

1. Runs lint checks.
2. Builds and pushes `${{ values.image_repository }}:<git-sha>` (immutable tag only).
3. Updates `apps/${{ values.service_name }}/overlays/dev/kustomization.yaml` in the centralized GitOps repository with that SHA.
4. Argo CD syncs the new image tag from Git and deploys to Kubernetes.

Kubernetes manifests live only in the centralized GitOps repository (`sajjadkhan-academy/argocd-centralized-repo-idp`).

### Required secret

This workflow uses the organization secret `GITOPS_REPO_TOKEN` (must have write access to the centralized GitOps repository). Ensure it is available to service repositories in your GitHub organization.
