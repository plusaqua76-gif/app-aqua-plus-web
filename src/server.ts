import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const APP_CONFIG = {
  apiUrl: process.env['API_URL'] || 'http://localhost:8080/api/v1',
  azureBlobStorageUrl: process.env['AZURE_BLOB_STORAGE_URL'] || '',
  environment: process.env['APP_ENV'] || 'development',
  production: process.env['APP_ENV'] === 'production'
};

(globalThis as any).APP_CONFIG = APP_CONFIG;

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let responseBody = '';

  res.write = function(chunk: any, ...args: any[]): boolean {
    if (chunk) {
      responseBody += chunk.toString();
    }
    return true;
  };

  res.end = function(chunk?: any, ...args: any[]): any {
    if (chunk) {
      responseBody += chunk.toString();
    }

    if (res.getHeader('content-type')?.toString().includes('text/html')) {
      const configScript = `
        <script>
          window.APP_CONFIG = ${JSON.stringify(APP_CONFIG)};
        </script>
      `;
      responseBody = responseBody.replace('</head>', `${configScript}</head>`);
    }

    res.write = originalWrite;
    res.end = originalEnd;
    return res.end(responseBody, ...args);
  };

  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
