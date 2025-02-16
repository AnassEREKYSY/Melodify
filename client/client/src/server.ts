import { Request, Response } from 'express'; // Import types
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

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

/**
 * Middleware to handle dynamic routes with parameters
 */
app.use((req: Request, res: Response, next: () => void) => { // Explicitly define req and res types
  const dynamicRoutes = ['/playlist/', '/song/'];

  if (dynamicRoutes.some(route => req.url.startsWith(route))) {
    res.sendFile(resolve(browserDistFolder, 'index.html'));
    return;
  }

  next();
});

/**
 * Define prerender routes for dynamic content
 */
const prerenderRoutes = [
  { path: '/playlist/:id', params: async (req: Request) => ({ id: req.params['id'] }) },
  { path: '/song/:id', params: async (req: Request) => ({ id: req.params['id'] }) },
];

prerenderRoutes.forEach((route) => {
  app.get(route.path, (req: Request, res: Response) => { // Explicitly define req and res types
    const params = route.params(req);
    angularApp.handle(req, params).then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      }
    }).catch((err) => {
      res.status(500).send('Error rendering the page');
    });
  });
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req: Request, res: Response, next: () => void) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
