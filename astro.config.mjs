import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
export default defineConfig({
  site: 'https://www.alchembright.com',
  output: 'static',
  outDir: process.env.ALCHEMBRIGHT_DIST_DIR || './dist',
  trailingSlash: 'always',
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: { syntaxHighlight: false, processor: satteri({ features: { smartPunctuation: false } }) },
});
