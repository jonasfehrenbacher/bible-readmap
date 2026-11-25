# Set up Vite, TypeScript, and Lit SSR

## 1. Create Vite

```sh
npm create vite@latest
```

Select lit and typescript. see: https://vite.dev/guide/

## 2. Instal Lit SSR

```sh
npm install @lit-labs/ssr @lit-labs/ssr-client
```

## 3. Cleanup Vite

Delete index.html and all app specific vite files.

## 4. Customize setup

src/layouts/base.ts:

```ts
import { html } from '@lit-labs/ssr';
import type { TemplateResult } from 'lit';

export function baseLayout(title: string, content: TemplateResult) {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body>
        ${content}
      </body>
    </html>`;
}
```

src/pages/home.ts:

```ts
import { html } from 'lit';
import { baseLayout } from '../layouts/base.ts';

export function home() {
  return baseLayout('My App', html`
    <main>
      <h1>My App</h1>
      <p>My Description.</p>
    </main>
  `);
}
```

scripts/build.mjs:

```ts
import { resolve } from 'node:path';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { build, createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true, ws: false, watch: null },
});

let markup;
try {
  const { home } = await vite.ssrLoadModule('/src/pages/home.ts');
  markup = await collectResult(render(home()));
} finally {
  await vite.close();
}

// Give Vite the generated document as its HTML entry without writing a source file.
const entry = resolve('index.html');
await build({
  build: { rolldownOptions: { input: entry } },
  plugins: [{
    name: 'render-homepage',
    resolveId(id) {
      if (id === entry) return entry;
    },
    load(id) {
      if (id === entry) return markup;
    },
  }],
});
```

package.json:

```json
"scripts": {
    ...
    "build": "tsc && node scripts/build.mjs",
    ...
  },
```

## 5. Live development

tsconfig.ts:

```json
{
  "compilerOptions": {
    ...
    "types": ["node", "vite/client"],
    ...
  },
  "include": ["src", "vite.config.ts"]
}
```

vite.config.ts:

```ts
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'lit-homepage-dev',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split('?', 1)[0];
        if (path !== '/' || (request.method !== 'GET' && request.method !== 'HEAD')) {
          return next();
        }

        try {
          const { home } = await server.ssrLoadModule('/src/pages/home.ts');
          const markup = await collectResult(render(home()));
          const html = await server.transformIndexHtml('/', markup);

          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(request.method === 'HEAD' ? undefined : html);
        } catch (error) {
          if (error instanceof Error) server.ssrFixStacktrace(error);
          next(error);
        }
      });
    },

    hotUpdate({ modules, server, timestamp }) {
      if (this.environment.name !== 'ssr' || modules.length === 0) return;

      const invalidatedModules = new Set<(typeof modules)[number]>();
      for (const module of modules) {
        this.environment.moduleGraph.invalidateModule(module, invalidatedModules, timestamp, true);
      }

      server.environments.client.hot.send({ type: 'full-reload' });
      return [];
    },
  }],
});
```