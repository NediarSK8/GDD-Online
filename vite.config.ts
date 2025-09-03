import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/GDD-Online/', // Substitua "GDD-Online" pelo nome do seu repositório
});
