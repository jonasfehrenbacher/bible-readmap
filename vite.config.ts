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
