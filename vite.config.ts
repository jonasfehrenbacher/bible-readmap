import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

interface BibleSource {
  books: { chapters: { verses: { text: string }[] }[] }[];
}

function chapterCounts(): Plugin {
  const id = '\0bible-chapter-counts';
  const source = fileURLToPath(new URL('./src/assets/elberfelder1871.json', import.meta.url));
  return {
    name: 'bible-chapter-counts',
    resolveId(name) {
      if (name === 'virtual:bible-chapter-counts') return id;
    },
    async load(name) {
      if (name !== id) return;
      this.addWatchFile(source);
      const { books } = JSON.parse(await readFile(source, 'utf8')) as BibleSource;
      const counts = books.map(({ chapters }) => chapters.map(({ verses }) =>
        verses.reduce((total, { text }) =>
          total + (text.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu)?.length ?? 0), 0)));
      return `export default ${JSON.stringify(counts)};`;
    },
  };
}

export default defineConfig({
  plugins: [chapterCounts(), {
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
