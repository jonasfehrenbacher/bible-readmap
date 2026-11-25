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
