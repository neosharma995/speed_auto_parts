import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '127.0.0.1',
        port: 5174,
        hmr: {
            host: '127.0.0.1',
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
        dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
        entries: [
            'resources/js/app.jsx',
            'resources/js/Pages/**/*.jsx',
        ],
        include: [
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            '@inertiajs/react',
            'axios',
            'lucide-react',
            'laravel-vite-plugin/inertia-helpers',
        ],
    },
});
