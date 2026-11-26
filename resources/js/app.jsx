import '../scss/app.scss';
import './bootstrap';

// Prevent React reconciler crashes when Google Translate wraps text nodes in <font> tags
if (typeof Node === 'function' && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
        if (child && child.parentNode !== this) {
            return child;
        }
        return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (referenceNode && referenceNode.parentNode !== this) {
            return newNode;
        }
        return originalInsertBefore.apply(this, arguments);
    };
}

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './Context/CartContext';
import { CurrencyProvider } from './Context/CurrencyContext';
import { LanguageProvider } from './Context/LanguageContext';
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
