import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg', 'apple-touch-icon.svg'],
            manifest: {
                name: 'TrendSpoon AI — AI 뉴스레터 자동화',
                short_name: 'TrendSpoon',
                description: '매일 아침, AI 트렌드를 떠먹여 드립니다 🥄',
                theme_color: '#0E0E1E',
                background_color: '#0E0E1E',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: 'icon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api/rss/techcrunch': {
                target: 'https://techcrunch.com',
                changeOrigin: true,
                rewrite: () => '/category/artificial-intelligence/feed/',
            },
            '/api/rss/theverge': {
                target: 'https://www.theverge.com',
                changeOrigin: true,
                rewrite: () => '/rss/index.xml',
            },
            '/api/rss/arstechnica': {
                target: 'https://feeds.arstechnica.com',
                changeOrigin: true,
                rewrite: () => '/arstechnica/technology-lab',
            },
            '/api/proxy-image': {
                target: 'http://localhost:5173',
                bypass: (req, res) => {
                    import('./api/proxy-image.js').then((module) => {
                        const handler = module.default;
                        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                        req.query = Object.fromEntries(url.searchParams);
                        handler(req, res);
                    }).catch(err => {
                        console.error('Image Proxy Error:', err);
                        res.statusCode = 500;
                        res.end('Image Proxy Error');
                    });
                    return false;
                }
            },
        },
    },
})
