import { html } from 'lit';
import { baseLayout } from '../layouts/base.ts';
import '../components/readmap-app/readmap-app.ts';
import { localToday } from '../shared/calendar.ts';
import { messages } from '../shared/locale.ts';

export function home() {
  const t = messages.en;
  return baseLayout(`${t.brand} · ${t.edition}`, t.heroDescription, html`
    <readmap-app initial-date=${localToday()}></readmap-app>
    <div id="print-mount" class="print-mount"></div>
    <script type="module">
      import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
      import '/src/components/readmap-app/readmap-app.ts';
    </script>
  `);
}
