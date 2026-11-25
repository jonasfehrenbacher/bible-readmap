import { html } from '@lit-labs/ssr';
import type { TemplateResult } from 'lit';

export function baseLayout(title: string, description: string, content: TemplateResult) {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="stylesheet" href="/src/styles/global.css" />
      </head>
      <body>
        ${content}
      </body>
    </html>`;
}
