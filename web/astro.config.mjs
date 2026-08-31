import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  server: {
    host: true,
    port: 3025,
    allowedHosts: ['consultaclientes.ddns.com.br', 'consultaclientes.mouragro.com.br'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3025,
    allowedHosts: ['consultaclientes.ddns.com.br', 'consultaclientes.mouragro.com.br'],
  },
});
