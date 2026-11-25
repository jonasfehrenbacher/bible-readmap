import { html } from 'lit';
import { baseLayout } from '../layouts/base.ts';

export function home() {
  return baseLayout('Bible Readmap', html`
    <main>
      <h1>Bible Readmap</h1>
      <p>Create a personalized Bible reading plan to print.</p>
    </main>
  `);
}
