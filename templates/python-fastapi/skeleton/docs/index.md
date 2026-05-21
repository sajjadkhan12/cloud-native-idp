# Documentation for ${{ values.service_name }}

## Overview

${{ values.description }}

This microservice has been automatically generated using the Backstage `python-fastapi` template.

## Tech Stack
- **Framework**: FastAPI (Python)
- **Observability**: Prometheus metrics enabled at `/metrics`
- **Database**: ${{ values.database }}
- **Deployments**: Managed via ArgoCD GitOps

## Getting Started

### Local Development
To run this service locally:

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the application:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port ${{ values.service_port }} --reload
   ```
