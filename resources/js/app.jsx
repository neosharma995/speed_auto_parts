import '../scss/app.scss';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './Context/CartContext';
import { CurrencyProvider } from './Context/CurrencyContext';
import {
    LanguageProvider,
    buildLocalizedPath,
    detectLocaleFromPath,
    isLocalizablePath,
} from './Context/LanguageContext';
import { WishlistProvider } from './Context/WishlistContext';

const syncCsrfMeta = (page) => {
    const newToken = page?.props?.csrf_token;
    if (newToken) {
        const meta = document.head.querySelector('meta[name="csrf-token"]');
        if (meta) {
            meta.content = newToken;
        }
        if (window.axios) {
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
        }
    }
};

router.on('before', (event) => {
    const visit = event?.detail?.visit;
    if (!visit || String(visit.method || 'get').toLowerCase() !== 'get') return;
    if (typeof window === 'undefined') return;

    const activeLang = detectLocaleFromPath(window.location.pathname);
    if (activeLang === 'EN') return;

    const targetUrl = visit.url;
    if (!targetUrl || !targetUrl.pathname) return;

    // Only prefix unprefixed localizable storefront routes
    if (
        isLocalizablePath(targetUrl.pathname) &&
        detectLocaleFromPath(targetUrl.pathname) === 'EN'
    ) {
        targetUrl.pathname = buildLocalizedPath(targetUrl.pathname, activeLang);
    }
});

router.on('navigate', (event) => {
    syncCsrfMeta(event.detail?.page);
});

router.on('success', (event) => {
    syncCsrfMeta(event.detail?.page);
});

router.on('invalid', (event) => {
    if (event.detail.response?.status === 419) {
        event.preventDefault();
        window.location.reload();
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'SPEED AUTOS PARTS';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        syncCsrfMeta(props?.initialPage);
        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <CurrencyProvider initialSettings={props?.initialPage?.props?.settings}>
                    <CartProvider initialCart={props?.initialPage?.props?.cart}>
                        <WishlistProvider>
                            <App {...props} />
                        </WishlistProvider>
                    </CartProvider>
                </CurrencyProvider>
            </LanguageProvider>
        );
    },
    progress: {
        color: '#F36B16',
    },
});
