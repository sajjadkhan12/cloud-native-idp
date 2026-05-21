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

1. Runs tests.
2. Builds `${{ values.image_repository }}:${GITHUB_SHA}`.
3. Pushes the immutable image tag to the configured registry.

**Argo CD Image Updater** automatically detects the new image in GHCR and updates the deployment in the centralized GitOps repository.

Kubernetes manifests live only in the centralized GitOps repository.
