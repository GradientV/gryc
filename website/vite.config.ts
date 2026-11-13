// vite config: react + tailwind and the @ alias for src/.
// `npm run build` runs vite twice (the browser build, then an SSR build of
// src/entry-server.tsx) and scripts/prerender.ts turns that into one HTML file per page.
//
// port 5180: 5173 to 5179 are other GradientV projects (5179 is the SYEP portal
// this site's Staff login sends people to).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(root, 'src')
        }
    },
    server: {
        port: 5180,
        strictPort: true
    },
    preview: {
        port: 4180
    }
});
