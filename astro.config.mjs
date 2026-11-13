import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://twinsconsulting.group',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
