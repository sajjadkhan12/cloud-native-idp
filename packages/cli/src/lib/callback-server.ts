import http from 'http';

/** Backstage CIMD pins CLI redirect to this URI. */
export const CLI_REDIRECT_URI = 'http://127.0.0.1:8055/callback';

export type CallbackResult = {
  code: string;
  state?: string;
  error?: string;
  errorDescription?: string;
};

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    server.closeAllConnections?.();
  });
}

export function waitForOAuthCallback(
  expectedState: string,
  timeoutMs = 300_000,
): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (result: CallbackResult | Error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutHandle);

      void closeServer(server)
        .catch(() => undefined)
        .finally(() => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(result);
          }
        });
    };

    const server = http.createServer((req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (settled) {
        res.writeHead(200);
        res.end('Already signed in. You can close this tab.');
        return;
      }

      const url = new URL(req.url, CLI_REDIRECT_URI);
      const state = url.searchParams.get('state') ?? undefined;
      const error = url.searchParams.get('error') ?? undefined;
      const errorDescription =
        url.searchParams.get('error_description') ?? undefined;
      const code = url.searchParams.get('code') ?? undefined;

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        '<html><body style="font-family:system-ui;padding:2rem">' +
          '<h2>Foundry CLI</h2><p>Signed in. Return to your terminal.</p>' +
          '</body></html>',
      );

      if (error) {
        finish({ code: '', state, error, errorDescription });
        return;
      }

      if (!code) {
        finish(new Error('OAuth callback missing authorization code'));
        return;
      }

      if (state && state !== expectedState) {
        finish(new Error('OAuth state mismatch (possible CSRF)'));
        return;
      }

      finish({ code, state });
    });

    server.on('error', err => {
      finish(err instanceof Error ? err : new Error(String(err)));
    });

    const timeoutHandle = setTimeout(() => {
      finish(
        new Error(
          'Timed out waiting for browser login (5 minutes). Try again with `foundry auth login`.',
        ),
      );
    }, timeoutMs);

    server.listen(8055, '127.0.0.1');
  });
}
