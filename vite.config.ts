import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets support both repository Pages paths and a custom domain.
export default defineConfig({ plugins: [react()], base: './' });
