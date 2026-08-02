// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  server: {
    host: '127.0.0.1',
    port: 4321,
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },

  adapter: node({
    mode: 'standalone',
  }),
});