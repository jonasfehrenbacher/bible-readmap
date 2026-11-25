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
