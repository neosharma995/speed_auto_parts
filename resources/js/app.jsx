import '../scss/app.scss';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './Context/CartContext';
import { WishlistProvider } from './Context/WishlistContext';

router.on('invalid', (event) => {
    if (event.detail.response?.status === 419) {
        event.preventDefault();
        window.location.reload();
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'AUTO PARTS';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CartProvider initialCart={props?.initialPage?.props?.cart}>
                <WishlistProvider>
                    <App {...props} />
                </WishlistProvider>
            </CartProvider>
        );
    },
    progress: {
        color: '#F36B16',
    },
});
