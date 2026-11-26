import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

const STORAGE_KEY = 'sap_selected_language';
const NON_DEFAULT_PREFIXES = ['ar', 'fr'];
const EXCLUDED_PATH_PREFIXES = [
    '/admin',
    '/supplier',
    '/api',
    '/login',
    '/register',
    '/forgot-password',
    '/logout',
    '/storage',
    '/checkout/stripe',
];

export function detectLocaleFromPath(pathname = '') {
    const clean = String(pathname || '/');
    const match = clean.match(/^\/(ar|fr)(?:\/|$)/i);
    return match ? match[1].toUpperCase() : 'EN';
}

export function isLocalizablePath(pathname = '') {
    const clean = String(pathname || '/');
    return !EXCLUDED_PATH_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

export function buildLocalizedPath(pathname = '/', targetLang = 'EN') {
    const clean = String(pathname || '/');
    if (!isLocalizablePath(clean)) {
        return clean;
    }

    // Strip any existing /ar or /fr prefix
    const stripped = clean.replace(/^\/(ar|fr)(?=\/|$)/i, '') || '/';
    const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`;
    const lower = String(targetLang || 'EN').toLowerCase();

    if (!NON_DEFAULT_PREFIXES.includes(lower)) {
        return normalized;
    }

    return normalized === '/' ? `/${lower}` : `/${lower}${normalized}`;
}

export const LANGUAGE_CATALOG = [
    { code: 'EN', name: 'English', htmlLang: 'en', dir: 'ltr', currency: 'USD' },
    { code: 'AR', name: 'العربية', htmlLang: 'ar', dir: 'rtl', currency: 'AED' },
    { code: 'FR', name: 'Français', htmlLang: 'fr', dir: 'ltr', currency: 'EUR' },
];

const TRANSLATIONS = {
    EN: {
        // Header & Utility Bar
        free_delivery_banner: 'Free UAE Delivery on Orders Over AED 500 — Dubai Express Dispatch',
        track_order: 'Track Order',
        help_support: 'Help & Support',
        search_placeholder: 'Search by part number, product, brand...',
        account: 'Account',
        sign_in_register: 'Sign In / Register',
        my_account: 'My Account',
        sign_out: 'Sign Out',
        all_categories: 'All Categories',
        home: 'Home',
        performance: 'Performance',
        shop_by_vehicle: 'Shop By Vehicle',
        brands: 'Brands',
        deals: 'Deals',
        support: 'Support',
        dubai_hotline: 'Dubai Hotline',
        admin: 'Admin',
        supplier: 'Supplier',
        regional_settings: 'Regional Settings',

        // Product Card
        in_stock: 'In Stock',
        out_of_stock: 'Out of Stock',
        add_to_cart: 'Add to Cart',
        added: 'Added',

        // Cart Drawer & Cart Page
        shopping_cart: 'Shopping Cart',
        cart_empty: 'Your shopping cart is currently empty.',
        continue_shopping: 'Continue Shopping',
        remove: 'Remove',
        estimated_subtotal: 'Estimated Subtotal',
        taxes_shipping_checkout: 'Taxes and shipping calculated at checkout.',
        proceed_to_checkout: 'Proceed to Checkout',
        view_cart: 'View Cart',
        order_summary_promo: 'Order Summary & Promo Codes',
        apply: 'Apply',
        coupon_discount: 'Coupon Discount',
        clear_entire_cart: 'Clear Entire Cart',
        explore_products: 'Explore Products',

        // Checkout
        secure_checkout: 'Secure Checkout',
        customer_information: 'Customer Information',
        shipping_address: 'Shipping Address',
        destination_country: 'Destination Country',
        payment_method: 'Payment Method',
        order_summary: 'Order Summary',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        free_delivery: 'FREE Delivery',
        total_payable: 'Total Payable',
        processing_order: 'Processing Order...',

        // Footer & Newsletter
        stay_in_the_loop: 'STAY IN THE LOOP',
        newsletter_heading: 'Get Exclusive Deals & Performance Updates',
        newsletter_desc: 'Subscribe to our newsletter and be the first to know about new products, special offers, and expert automotive insights.',
        enter_email: 'Enter your email address',
        subscribe: 'Subscribe',
        subscribing: 'Subscribing...',
        shop: 'Shop',
        all_products: 'All Products',
        quick_links: 'Quick Links',
        customer_service: 'Customer Service',

        // Storefront Sections & Catalog
        popular_categories: 'Popular Categories',
        view_all_categories: 'View All Categories',
        featured_products: 'Featured Products',
        best_sellers: 'Best Sellers',
        new_arrivals: 'New Arrivals',
        all: 'All',
        view_all: 'View All',
        certified_brands: 'Certified Performance Brands',
        certified_brands_desc: 'We partner directly with leading OEM and motorsport manufacturers for 100% genuine guaranteed spares.',
        browse_categories: 'Product Categories',
        browse_categories_desc: 'Browse our complete performance spare parts catalog organized by system.',
        explore_parts: 'Explore Parts',
        products_count: 'Products',
        filters: 'Filters',
        categories: 'Categories',
        clear_filters: 'Clear Filters',
        no_products_found: 'No products found matching your criteria.',
        part_number: 'Part Number',
        sku: 'SKU',
        description: 'Description',
        technical_specs: 'Technical Specifications',
        vehicle_fitment: 'Vehicle Fitment',
        customer_reviews: 'Customer Reviews',
        related_products: 'Related Products',
        buy_now: 'Buy Now',
        select_options: 'Select Options',
        off: 'OFF',
    },
    AR: {
        // Header & Utility Bar
        free_delivery_banner: 'توصيل مجاني داخل الإمارات للطلبات فوق 500 درهم — شحن سريع من دبي',
        track_order: 'تتبع الطلب',
        help_support: 'المساعدة والدعم',
        search_placeholder: 'ابحث برقم القطعة أو المنتج أو العلامة التجارية...',
        account: 'الحساب',
        sign_in_register: 'تسجيل الدخول / إنشاء حساب',
        my_account: 'حسابي',
        sign_out: 'تسجيل الخروج',
        all_categories: 'جميع الفئات',
        home: 'الرئيسية',
        performance: 'قطع الأداء',
        shop_by_vehicle: 'تسوق حسب المركبة',
        brands: 'العلامات التجارية',
        deals: 'العروض',
        support: 'الدعم',
        dubai_hotline: 'خط دبي الساخن',
        admin: 'الإدارة',
        supplier: 'المورد',
        regional_settings: 'الإعدادات الإقليمية',

        // Product Card
        in_stock: 'متوفر',
        out_of_stock: 'غير متوفر',
        add_to_cart: 'أضف إلى السلة',
        added: 'تمت الإضافة',

        // Cart Drawer & Cart Page
        shopping_cart: 'سلة التسوق',
        cart_empty: 'سلة التسوق فارغة حالياً.',
        continue_shopping: 'متابعة التسوق',
        remove: 'إزالة',
        estimated_subtotal: 'المجموع الفرعي التقديري',
        taxes_shipping_checkout: 'يتم احتساب الضرائب والشحن عند الدفع.',
        proceed_to_checkout: 'إتمام الشراء',
        view_cart: 'عرض السلة',
        order_summary_promo: 'ملخص الطلب وأكواد الخصم',
        apply: 'تطبيق',
        coupon_discount: 'خصم الكوبون',
        clear_entire_cart: 'إفراغ السلة بالكامل',
        explore_products: 'تصفح المنتجات',

        // Checkout
        secure_checkout: 'الدفع الآمن',
        customer_information: 'بيانات العميل',
        shipping_address: 'عنوان الشحن',
        destination_country: 'دولة التوصيل',
        payment_method: 'طريقة الدفع',
        order_summary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        free_delivery: 'توصيل مجاني',
        total_payable: 'الإجمالي المستحق',
        processing_order: 'جاري معالجة الطلب...',

        // Footer & Newsletter
        stay_in_the_loop: 'ابقَ على اطلاع',
        newsletter_heading: 'احصل على عروض حصرية وتحديثات الأداء',
        newsletter_desc: 'اشترك في نشرتنا البريدية لتكون أول من يعلم بالمنتجات الجديدة والعروض الخاصة ونصائح السيارات.',
        enter_email: 'أدخل بريدك الإلكتروني',
        subscribe: 'اشترك',
        subscribing: 'جاري الاشتراك...',
        shop: 'المتجر',
        all_products: 'جميع المنتجات',
        quick_links: 'روابط سريعة',
        customer_service: 'خدمة العملاء',

        // Storefront Sections & Catalog
        popular_categories: 'الفئات الشائعة',
        view_all_categories: 'عرض جميع الفئات',
        featured_products: 'المنتجات المميزة',
        best_sellers: 'الأكثر مبيعاً',
        new_arrivals: 'وصل حديثاً',
        all: 'الكل',
        view_all: 'عرض الكل',
        certified_brands: 'العلامات التجارية المعتمدة للأداء',
        certified_brands_desc: 'نتعاون مباشرة مع كبرى الشركات المصنعة لقطع الغيار الأصلية والرياضية بضمان 100%.',
        browse_categories: 'فئات المنتجات',
        browse_categories_desc: 'تصفح كتالوج قطع الغيار الرياضية الكامل مرتباً حسب أنظمة المركبة.',
        explore_parts: 'استعراض القطع',
        products_count: 'منتجات',
        filters: 'تصفية',
        categories: 'الفئات',
        clear_filters: 'مسح الفلاتر',
        no_products_found: 'لم يتم العثور على منتجات مطابقة لمعايير البحث.',
        part_number: 'رقم القطعة',
        sku: 'رمز المنتج',
        description: 'الوصف',
        technical_specs: 'المواصفات الفنية',
        vehicle_fitment: 'توافق المركبات',
        customer_reviews: 'تقييمات العملاء',
        related_products: 'منتجات ذات صلة',
        buy_now: 'اشترِ الآن',
        select_options: 'اختر المواصفات',
        off: 'خصم',
    },
    FR: {
        // Header & Utility Bar
        free_delivery_banner: 'Livraison gratuite aux EAU dès 500 AED — Expédition Express Dubaï',
        track_order: 'Suivre la commande',
        help_support: 'Aide & Support',
        search_placeholder: 'Rechercher par référence, produit, marque...',
        account: 'Compte',
        sign_in_register: 'Connexion / Inscription',
        my_account: 'Mon Compte',
        sign_out: 'Déconnexion',
        all_categories: 'Toutes les catégories',
        home: 'Accueil',
        performance: 'Performance',
        shop_by_vehicle: 'Par véhicule',
        brands: 'Marques',
        deals: 'Promotions',
        support: 'Support',
        dubai_hotline: 'Ligne directe Dubaï',
        admin: 'Admin',
        supplier: 'Fournisseur',
        regional_settings: 'Paramètres régionaux',

        // Product Card
        in_stock: 'En stock',
        out_of_stock: 'Rupture de stock',
        add_to_cart: 'Ajouter au panier',
        added: 'Ajouté',

        // Cart Drawer & Cart Page
        shopping_cart: 'Panier',
        cart_empty: 'Votre panier est actuellement vide.',
        continue_shopping: 'Continuer vos achats',
        remove: 'Supprimer',
        estimated_subtotal: 'Sous-total estimé',
        taxes_shipping_checkout: 'Taxes et livraison calculées lors du paiement.',
        proceed_to_checkout: 'Passer la commande',
        view_cart: 'Voir le panier',
        order_summary_promo: 'Résumé & Codes Promo',
        apply: 'Appliquer',
        coupon_discount: 'Remise coupon',
        clear_entire_cart: 'Vider le panier',
        explore_products: 'Explorer les produits',

        // Checkout
        secure_checkout: 'Paiement sécurisé',
        customer_information: 'Informations client',
        shipping_address: 'Adresse de livraison',
        destination_country: 'Pays de livraison',
        payment_method: 'Mode de paiement',
        order_summary: 'Résumé de la commande',
        subtotal: 'Sous-total',
        shipping: 'Livraison',
        free_delivery: 'Livraison GRATUITE',
        total_payable: 'Total à payer',
        processing_order: 'Traitement en cours...',

        // Footer & Newsletter
        stay_in_the_loop: 'RESTEZ INFORMÉ',
        newsletter_heading: 'Offres exclusives & nouveautés performance',
        newsletter_desc: 'Abonnez-vous à notre newsletter pour découvrir en avant-première nos nouveaux produits, offres spéciales et conseils auto.',
        enter_email: 'Entrez votre adresse e-mail',
        subscribe: "S'abonner",
        subscribing: 'Inscription...',
        shop: 'Boutique',
        all_products: 'Tous les produits',
        quick_links: 'Liens rapides',
        customer_service: 'Service client',

        // Storefront Sections & Catalog
        popular_categories: 'Catégories populaires',
        view_all_categories: 'Voir toutes les catégories',
        featured_products: 'Produits en vedette',
        best_sellers: 'Meilleures ventes',
        new_arrivals: 'Nouveautés',
        all: 'Tous',
        view_all: 'Voir tout',
        certified_brands: 'Marques Performance Certifiées',
        certified_brands_desc: "Nous travaillons directement avec les plus grands fabricants OEM et motorsport pour des pièces 100% d'origine.",
        browse_categories: 'Catégories de produits',
        browse_categories_desc: 'Parcourez notre catalogue complet de pièces performance classé par système.',
        explore_parts: 'Voir les pièces',
        products_count: 'Produits',
        filters: 'Filtres',
        categories: 'Catégories',
        clear_filters: 'Réinitialiser',
        no_products_found: 'Aucun produit ne correspond à votre recherche.',
        part_number: 'Référence pièce',
        sku: 'SKU',
        description: 'Description',
        technical_specs: 'Spécifications techniques',
        vehicle_fitment: 'Compatibilité véhicule',
        customer_reviews: 'Avis clients',
        related_products: 'Produits similaires',
        buy_now: 'Acheter maintenant',
        select_options: 'Choisir les options',
        off: 'DE RÉDUCTION',
    },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            const urlLang = detectLocaleFromPath(window.location.pathname);
            if (TRANSLATIONS[urlLang]) {
                return urlLang;
            }
        }
        return 'EN';
    });

    const activeMeta = useMemo(
        () => LANGUAGE_CATALOG.find((l) => l.code === language) || LANGUAGE_CATALOG[0],
        [language]
    );

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = activeMeta.htmlLang;
            document.documentElement.dir = activeMeta.dir;
        }
    }, [activeMeta]);

    // Keep state synced with URL prefix on Inertia navigation
    useEffect(() => {
        const offNavigate = router.on('navigate', () => {
            if (typeof window === 'undefined') return;
            const urlLang = detectLocaleFromPath(window.location.pathname);
            if (urlLang !== language && TRANSLATIONS[urlLang]) {
                setLanguageState(urlLang);
            }
        });
        return () => {
            if (typeof offNavigate === 'function') offNavigate();
        };
    }, [language]);

    const setLanguage = (code) => {
        const upper = String(code || 'EN').toUpperCase();
        const next = TRANSLATIONS[upper] ? upper : 'EN';

        setLanguageState(next);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // ignore storage errors
            }

            if (isLocalizablePath(window.location.pathname)) {
                const nextPath = buildLocalizedPath(window.location.pathname, next);
                const targetUrl = `${nextPath}${window.location.search}${window.location.hash}`;
                if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== targetUrl) {
                    window.history.replaceState(window.history.state, '', targetUrl);
                }
            }
        }
    };

    const value = useMemo(() => {
        const dict = TRANSLATIONS[language] || TRANSLATIONS.EN;
        const lower = String(language || 'EN').toLowerCase();
        const t = (key, fallback = '') => dict[key] || TRANSLATIONS.EN[key] || fallback || key;
        const localize = (entity, field, fallback = '') => {
            if (!entity || typeof entity !== 'object') return fallback || '';
            if (lower !== 'en') {
                const translated = entity?.translations?.[lower]?.[field];
                if (typeof translated === 'string' && translated.trim() !== '') {
                    return translated;
                }
            }
            return entity[field] ?? fallback ?? '';
        };

        return {
            language,
            activeLanguage: activeMeta,
            isRtl: activeMeta.dir === 'rtl',
            availableLanguages: LANGUAGE_CATALOG,
            setLanguage,
            t,
            localize,
        };
    }, [language, activeMeta]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        return {
            language: 'EN',
            activeLanguage: LANGUAGE_CATALOG[0],
            isRtl: false,
            availableLanguages: LANGUAGE_CATALOG,
            setLanguage: () => {},
            t: (key, fallback = '') => TRANSLATIONS.EN[key] || fallback || key,
            localize: (entity, field, fallback = '') => (entity && typeof entity === 'object' ? entity[field] ?? fallback ?? '' : fallback || ''),
        };
    }
    return ctx;
}
