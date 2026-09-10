import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
export default defineConfig({
  site: process.env.ALCHEMBRIGHT_SITE || 'https://www.alchembright.com',
  base: process.env.ALCHEMBRIGHT_BASE || '/',
  output: 'static',
  outDir: process.env.ALCHEMBRIGHT_DIST_DIR || './dist',
  trailingSlash: 'always',
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: { syntaxHighlight: false, processor: satteri({ features: { smartPunctuation: false } }) },
});
