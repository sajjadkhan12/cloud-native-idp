# Foundry CLI

Command-line interface for [Foundry IDP](../README.md). Scaffolds services through the same Backstage Scaffolder API as the web UI, so new components appear in the catalog automatically.

Built for **local development and portfolio demos**: guest login with one command, owner matches your session (Catalog **Owned** filter works).

## Prerequisites

- Foundry IDP running: `yarn start` (backend `http://localhost:7007`)
- `GITHUB_TOKEN` in `.env` for scaffolder GitHub actions

## Quick start

From the monorepo root:

```bash
yarn install
yarn workspace @foundry/cli build

# Browser login (opens Foundry, same as UI — stores refresh token)
yarn foundry auth login

# Guest only (local dev, no GitHub)
yarn foundry auth login --guest

yarn foundry templates list

yarn foundry create python-fastapi \
  --name payment-api \
  --org sajjadkhan-academy \
  --registry ghcr.io/sajjadkhan-academy \
  --watch
```

Or: `./node_modules/.bin/foundry --help`

## Authentication

| Command | Description |
|---------|-------------|
| `foundry auth login` | Open browser, sign in (GitHub), store token + refresh (~8h) |
| `foundry auth login --guest` | Guest JWT for local dev only |
| `foundry auth login --token <jwt>` | Manual JWT from DevTools (advanced) |
| `foundry auth refresh` | Refresh session when access token expires |
| `foundry auth github` | Manual DevTools steps (fallback) |
| `foundry auth whoami` | Show identity + test backend (auto-refresh if needed) |
| `foundry auth logout` | Clear stored credentials |

Backend must have `auth.experimentalClientIdMetadataDocuments.enabled: true`, `auth.experimentalRefreshToken.enabled: true`, and `auth.session.secret` in `app-config.yaml` (already set in this repo). **Restart `yarn start` after changing auth config** — OIDC routes are not hot-reloaded.

Set `AUTH_SESSION_SECRET` in `.env` (any long random string). Browser login opens `http://localhost:7007/api/auth/v1/authorize`, which redirects to the app consent page at `http://localhost:3000/oauth2/authorize/...`; the CLI listens on `http://127.0.0.1:8055/callback`.

Config: `~/.config/foundry/config.yaml` (mode `0600`)

Env overrides: `FOUNDRY_TOKEN`, `FOUNDRY_BACKEND_URL`, `FOUNDRY_APP_URL`

### Owner and Catalog **Owned**

If you omit `--owner`, the CLI uses your **signed-in identity** from the token (e.g. `user:development/guest` for guest login). That matches the catalog **Owned** filter in the UI.

For GitHub sign-in, use `--owner user:default/<github-login>` or set:

```bash
yarn foundry config set defaults.owner user:default/sajjadkhan12
```

## Commands

```
foundry auth login|refresh|whoami|logout
foundry config path|show|set|get
foundry templates list
foundry create service|python-fastapi [options]
foundry tasks get|watch <taskId>
```

### Create service options

| Flag | Template field | Default |
|------|----------------|---------|
| `-n, --name` | `service_name` | required |
| `-t, --template` | (service only) | `python-fastapi` |
| `--org` | `github_org` | `sajjadkhan-academy` |
| `--registry` | `image_registry` | `ghcr.io/sajjadkhan-academy` |
| `--owner` | `owner` | from `auth whoami` |
| `--env` | `environment` | `dev` |
| `--port` | `service_port` | `8080` |
| `--watch` | — | stream logs until done |

## Development

```bash
yarn workspace @foundry/cli build
yarn workspace @foundry/cli test
yarn foundry --help
```
