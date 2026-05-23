export const GITHUB_LOGIN_STEPS = `
Do NOT copy from the Cookies tab — that is wrong for the CLI.

You pasted something like:
  eyJ...refresh...; argocd.token=eyJ...
That mixes a refresh cookie and an Argo CD login cookie. The Foundry CLI
needs a single Backstage Bearer JWT from an API request.

─── Method A (easiest): copy from Network → Response ───

  1. Open http://localhost:3000 and sign in with GitHub.
  2. DevTools → Network. Filter: refresh OR 7007
  3. Find a request named like:
       refresh?optional&scope=...&env=development
     URL host: localhost:7007  path: /api/auth/github/refresh
  4. Click it → Response tab (not Cookies, not Headers cookie).
  5. Copy ONLY the value of backstageIdentity.token (starts with eyJ...).
  6. Run:

       yarn foundry auth login --token "<that-token-only>"

─── Method B: copy Authorization header ───

  1. In Network, click any request to http://localhost:7007/api/...
     Examples: /api/catalog/entities, /api/auth/v1/userinfo
  2. Headers → Request Headers → authorization
  3. Copy the token AFTER "Bearer " (one long eyJ... string, no semicolons).

─── Valid token checklist ───

  ✓ One string, three dot-separated parts (xxxxx.yyyyy.zzzzz)
  ✓ No semicolons, no "argocd.token=", no cookie names
  ✓ Decodes with iss containing localhost:7007/api/auth
  ✓ sub like user:development/sajjadkhan12 (not a UUID)

─── Verify ───

  yarn foundry auth whoami
  → must show Backend: connected (no 401)

─── GitHub in browser but guest in CLI? ───

  yarn foundry auth login          → always guest (dev API only)
  yarn foundry auth login --token  → must use steps above for GitHub
`.trim();
