import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { METRIKA_ID, metrikaPixel, metrikaScript } from './src/lib/metrika';

// Puts the Metrika loader into <head> and the noscript pixel into <body>, both from the
// one constant in src/lib/metrika.ts. With METRIKA_ID null nothing is injected.
function metrika(): Plugin {
  return {
    name: 'cal-metrika',
    transformIndexHtml() {
      if (METRIKA_ID === null) return [];
      return [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://mc.yandex.ru' }, injectTo: 'head' },
        { tag: 'script', children: metrikaScript(METRIKA_ID), injectTo: 'head' },
        {
          tag: 'noscript',
          children: `<div><img class="metrika-pixel" src="${metrikaPixel(METRIKA_ID)}" alt="" /></div>`,
          injectTo: 'body',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), metrika()],
  server: {
    // Fixed port: other local projects also default to 5173.
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
