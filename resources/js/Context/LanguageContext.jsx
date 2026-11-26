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

        // Hero & Vehicle Finder
        hero_eyebrow: 'PERFORMANCE PARTS FOR DRIVERS',
        hero_build: 'BUILD',
        hero_upgrade: 'UPGRADE',
        hero_perform: 'PERFORM',
        hero_desc: 'Premium automotive spare parts for street, track, and garage builds.',
        hero_shop_cta: 'Shop Performance',
        hero_vehicle_cta: 'Find By Vehicle',
        vf_find_parts_for: 'Find Parts For',
        vf_your_vehicle: 'Your Vehicle',
        vf_year: 'Year',
        vf_select_year: 'Select Year',
        vf_make: 'Make',
        vf_select_make: 'Select Make',
        vf_model: 'Model',
        vf_select_model: 'Select Model',
        vf_engine: 'Engine',
        vf_select_engine: 'Select Engine',
        vf_find_parts: 'Find Parts',

        // Homepage Sections
        promo_up_to: 'UP TO',
        promo_20_off: '20% OFF',
        promo_tires_sub: 'On Performance Tires',
        promo_shop_tires: 'Shop Tires',
        promo_brakes_title: 'Brake Upgrade Packages',
        promo_save_15: 'Save up to 15%',
        promo_shop_brakes: 'Shop Brakes',
        promo_engine_title: 'Engine Performance Parts',
        promo_engine_sub: 'More Power. More Performance.',
        promo_shop_engine: 'Shop Engine Parts',
        shop_by_vehicle_type: 'Shop by Vehicle Type',
        view_all_vehicle_types: 'View All Vehicle Types',
        vt_cars: 'Cars',
        vt_suvs: 'SUVs',
        vt_trucks: 'Trucks',
        vt_vans: 'Vans',
        vt_motorcycles: 'Motorcycles',
        popular_brands: 'Popular Brands',
        view_all_brands: 'View All Brands',
        why_choose: 'Why Choose',
        why_choose_brand: 'Speed Autos Parts?',
        wc_genuine_title: 'Genuine Parts',
        wc_genuine_desc: '100% authentic & certified',
        wc_shipping_title: 'International Shipping',
        wc_shipping_desc: 'To 100+ countries',
        wc_returns_title: '30-Day Returns',
        wc_returns_desc: 'Hassle-free & simple',
        wc_support_title: 'Expert Support',
        wc_support_desc: 'Automotive specialists',
        top_picks_title: 'Top Picks for Your Build',
        tp_brakes: 'Performance Brakes',
        tp_intakes: 'Cold Air Intakes',
        tp_coilovers: 'Coilover Kits',
        tp_exhaust: 'Exhaust Systems',
        rr_eyebrow: 'REAL RESULTS',
        rr_heading_line1: 'BUILT BY ENTHUSIASTS',
        rr_heading_line2: 'TRUSTED WORLDWIDE',
        rr_desc: 'See how our parts perform in real builds from customers around the globe.',
        rr_cta: 'Explore Customer Builds',
        rr_happy_customers: 'Happy Customers',
        rr_parts_in_stock: 'Parts In Stock',
        rr_countries_served: 'Countries Served',
        rr_customer_rating: 'Customer Rating',

        // Footer Links & Info
        footer_brand_desc: 'Your trusted global source for premium automotive spare parts, performance upgrades, and genuine replacement components.',
        footer_performance_parts: 'Performance Parts',
        footer_tires: 'Tires',
        footer_brakes: 'Brakes',
        footer_exhaust: 'Exhaust',
        footer_suspension: 'Suspension',
        footer_information: 'Information',
        footer_about_us: 'About Us',
        footer_contact_us: 'Contact Us',
        footer_shipping_delivery: 'Shipping & Delivery',
        footer_returns_refunds: 'Returns & Refunds',
        footer_terms: 'Terms & Conditions',
        footer_privacy: 'Privacy Policy',
        footer_customer_support: 'Customer Support',
        footer_track_your_order: 'Track Your Order',
        footer_help_center: 'Help Center',
        footer_faqs: 'FAQs',
        footer_warranty: 'Warranty Information',
        footer_compatibility: 'Part Compatibility',
        footer_request_part: 'Request a Part',
        footer_need_help: 'Need Help?',
        footer_hours: 'Mon – Sat, 9:00 AM – 7:00 PM (Dubai / GST)',
        footer_contact_support: 'Contact Support',
        footer_copyright: 'All Rights Reserved.',

        // Shop Page
        shop_catalog: 'Shop Catalog',
        shop_heading: 'Automotive Performance Catalog',
        filter_catalog: 'Filter Catalog',
        reset_all: 'Reset All',
        category: 'Category',
        brand: 'Brand',
        all_brands: 'All Brands',
        sort_newest: 'Sort by: Newest Arrivals',
        sort_price_asc: 'Price: Low to High',
        sort_price_desc: 'Price: High to Low',
        sort_rating: 'Top Customer Rated',
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

        // Hero & Vehicle Finder
        hero_eyebrow: 'قطع أداء عالية للسائقين',
        hero_build: 'ابنِ',
        hero_upgrade: 'طوّر',
        hero_perform: 'تألّق',
        hero_desc: 'قطع غيار سيارات فاخرة وعالية الأداء للطرق والحلبات ومشاريع التعديل.',
        hero_shop_cta: 'تسوّق قطع الأداء',
        hero_vehicle_cta: 'ابحث حسب المركبة',
        vf_find_parts_for: 'ابحث عن قطع',
        vf_your_vehicle: 'لمركبتك',
        vf_year: 'السنة',
        vf_select_year: 'اختر السنة',
        vf_make: 'الشركة المصنعة',
        vf_select_make: 'اختر الشركة',
        vf_model: 'الموديل',
        vf_select_model: 'اختر الموديل',
        vf_engine: 'المحرك',
        vf_select_engine: 'اختر المحرك',
        vf_find_parts: 'ابحث عن القطع',

        // Homepage Sections
        promo_up_to: 'خصم يصل إلى',
        promo_20_off: '20% خصم',
        promo_tires_sub: 'على الإطارات الرياضية',
        promo_shop_tires: 'تسوّق الإطارات',
        promo_brakes_title: 'باقات ترقية الفرامل',
        promo_save_15: 'وفّر حتى 15%',
        promo_shop_brakes: 'تسوّق الفرامل',
        promo_engine_title: 'قطع أداء المحرك',
        promo_engine_sub: 'قوة أكبر. أداء أعلى.',
        promo_shop_engine: 'تسوّق قطع المحرك',
        shop_by_vehicle_type: 'تسوق حسب نوع المركبة',
        view_all_vehicle_types: 'عرض جميع أنواع المركبات',
        vt_cars: 'سيارات',
        vt_suvs: 'دفع رباعي',
        vt_trucks: 'شاحنات',
        vt_vans: 'فانات',
        vt_motorcycles: 'دراجات نارية',
        popular_brands: 'العلامات التجارية الشائعة',
        view_all_brands: 'عرض جميع العلامات',
        why_choose: 'لماذا تختار',
        why_choose_brand: 'سبيد أوتو بارتس؟',
        wc_genuine_title: 'قطع أصلية 100%',
        wc_genuine_desc: 'معتمدة ومضمونة المصدر',
        wc_shipping_title: 'شحن دولي سريع',
        wc_shipping_desc: 'لأكثر من 100 دولة',
        wc_returns_title: 'إرجاع خلال 30 يوماً',
        wc_returns_desc: 'بكل سهولة ومرونة',
        wc_support_title: 'دعم فني متخصص',
        wc_support_desc: 'خبراء قطع غيار السيارات',
        top_picks_title: 'أفضل الاختيارات لمركبتك',
        tp_brakes: 'فرامل رياضية',
        tp_intakes: 'سحب هواء بارد',
        tp_coilovers: 'أطقم كويلوفر',
        tp_exhaust: 'أنظمة العادم',
        rr_eyebrow: 'نتائج حقيقية',
        rr_heading_line1: 'بأيدي عشّاق السيارات',
        rr_heading_line2: 'وموثوقة حول العالم',
        rr_desc: 'شاهد كيف تؤدي قطعنا في مشاريع حقيقية من عملائنا حول العالم.',
        rr_cta: 'استعرض مشاريع العملاء',
        rr_happy_customers: 'عميل سعيد',
        rr_parts_in_stock: 'قطعة متوفرة',
        rr_countries_served: 'دولة نخدمها',
        rr_customer_rating: 'تقييم العملاء',

        // Footer Links & Info
        footer_brand_desc: 'مصدرك العالمي الموثوق لقطع غيار السيارات الفاخرة، ترقيات الأداء، والقطع الأصلية المعتمدة.',
        footer_performance_parts: 'قطع الأداء',
        footer_tires: 'الإطارات',
        footer_brakes: 'الفرامل',
        footer_exhaust: 'العادم',
        footer_suspension: 'نظام التعليق',
        footer_information: 'معلومات',
        footer_about_us: 'من نحن',
        footer_contact_us: 'اتصل بنا',
        footer_shipping_delivery: 'الشحن والتوصيل',
        footer_returns_refunds: 'الإرجاع والاسترداد',
        footer_terms: 'الشروط والأحكام',
        footer_privacy: 'سياسة الخصوصية',
        footer_customer_support: 'دعم العملاء',
        footer_track_your_order: 'تتبع طلبك',
        footer_help_center: 'مركز المساعدة',
        footer_faqs: 'الأسئلة الشائعة',
        footer_warranty: 'معلومات الضمان',
        footer_compatibility: 'توافق القطع',
        footer_request_part: 'اطلب قطعة غيار',
        footer_need_help: 'هل تحتاج مساعدة؟',
        footer_hours: 'الإثنين – السبت، 9:00 صباحاً – 7:00 مساءً (توقيت دبي)',
        footer_contact_support: 'تواصل مع الدعم',
        footer_copyright: 'جميع الحقوق محفوظة.',

        // Shop Page
        shop_catalog: 'كتالوج المتجر',
        shop_heading: 'كتالوج قطع الأداء الرياضي',
        filter_catalog: 'تصفية الكتالوج',
        reset_all: 'إعادة تعيين',
        category: 'الفئة',
        brand: 'العلامة التجارية',
        all_brands: 'جميع العلامات',
        sort_newest: 'الترتيب: الأحدث',
        sort_price_asc: 'السعر: من الأقل للأعلى',
        sort_price_desc: 'السعر: من الأعلى للأقل',
        sort_rating: 'الأعلى تقييماً',
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

        // Hero & Vehicle Finder
        hero_eyebrow: 'PIÈCES PERFORMANCE POUR PILOTES',
        hero_build: 'CONSTRUISEZ',
        hero_upgrade: 'AMÉLIOREZ',
        hero_perform: 'PERFORMEZ',
        hero_desc: 'Pièces détachées automobiles premium pour la route, le circuit et les préparations.',
        hero_shop_cta: 'Voir la boutique',
        hero_vehicle_cta: 'Par véhicule',
        vf_find_parts_for: 'Trouver des pièces pour',
        vf_your_vehicle: 'Votre Véhicule',
        vf_year: 'Année',
        vf_select_year: 'Choisir l’année',
        vf_make: 'Marque',
        vf_select_make: 'Choisir la marque',
        vf_model: 'Modèle',
        vf_select_model: 'Choisir le modèle',
        vf_engine: 'Moteur',
        vf_select_engine: 'Choisir le moteur',
        vf_find_parts: 'Trouver les pièces',

        // Homepage Sections
        promo_up_to: "JUSQU'À",
        promo_20_off: '-20%',
        promo_tires_sub: 'Sur les pneus performance',
        promo_shop_tires: 'Voir les pneus',
        promo_brakes_title: 'Kits de freinage sport',
        promo_save_15: "Économisez jusqu'à 15%",
        promo_shop_brakes: 'Voir les freins',
        promo_engine_title: 'Pièces performance moteur',
        promo_engine_sub: 'Plus de puissance. Plus de performance.',
        promo_shop_engine: 'Pièces moteur',
        shop_by_vehicle_type: 'Par type de véhicule',
        view_all_vehicle_types: 'Voir tous les véhicules',
        vt_cars: 'Voitures',
        vt_suvs: 'SUV',
        vt_trucks: 'Pick-up & Camions',
        vt_vans: 'Utilitaires',
        vt_motorcycles: 'Motos',
        popular_brands: 'Marques populaires',
        view_all_brands: 'Voir toutes les marques',
        why_choose: 'Pourquoi choisir',
        why_choose_brand: 'Speed Autos Parts ?',
        wc_genuine_title: 'Pièces d’origine',
        wc_genuine_desc: '100% authentiques & certifiées',
        wc_shipping_title: 'Livraison internationale',
        wc_shipping_desc: 'Vers plus de 100 pays',
        wc_returns_title: 'Retours sous 30 jours',
        wc_returns_desc: 'Simples et sans tracas',
        wc_support_title: 'Support d’experts',
        wc_support_desc: 'Spécialistes automobiles',
        top_picks_title: 'Meilleurs choix pour votre projet',
        tp_brakes: 'Freins Performance',
        tp_intakes: 'Admissions d’air froid',
        tp_coilovers: 'Kits Combinés Filetés',
        tp_exhaust: 'Systèmes d’échappement',
        rr_eyebrow: 'RÉSULTATS RÉELS',
        rr_heading_line1: 'CONÇU PAR DES PASSIONNÉS',
        rr_heading_line2: 'APPROUVÉ DANS LE MONDE',
        rr_desc: 'Découvrez les performances de nos pièces sur les préparations de nos clients.',
        rr_cta: 'Voir les préparations',
        rr_happy_customers: 'Clients satisfaits',
        rr_parts_in_stock: 'Pièces en stock',
        rr_countries_served: 'Pays desservis',
        rr_customer_rating: 'Note client',

        // Footer Links & Info
        footer_brand_desc: 'Votre source mondiale de confiance pour les pièces automobiles premium, préparations performance et pièces d’origine.',
        footer_performance_parts: 'Pièces Performance',
        footer_tires: 'Pneus',
        footer_brakes: 'Freins',
        footer_exhaust: 'Échappement',
        footer_suspension: 'Suspension',
        footer_information: 'Informations',
        footer_about_us: 'À propos',
        footer_contact_us: 'Contactez-nous',
        footer_shipping_delivery: 'Livraison & Expédition',
        footer_returns_refunds: 'Retours & Remboursements',
        footer_terms: 'Conditions générales',
        footer_privacy: 'Politique de confidentialité',
        footer_customer_support: 'Support Client',
        footer_track_your_order: 'Suivre votre commande',
        footer_help_center: 'Centre d’aide',
        footer_faqs: 'FAQ',
        footer_warranty: 'Garantie',
        footer_compatibility: 'Compatibilité pièces',
        footer_request_part: 'Demander une pièce',
        footer_need_help: 'Besoin d’aide ?',
        footer_hours: 'Lun – Sam, 9h00 – 19h00 (Dubaï / GST)',
        footer_contact_support: 'Contacter le support',
        footer_copyright: 'Tous droits réservés.',

        // Shop Page
        shop_catalog: 'Catalogue Boutique',
        shop_heading: 'Catalogue Performance Automobile',
        filter_catalog: 'Filtrer le catalogue',
        reset_all: 'Réinitialiser',
        category: 'Catégorie',
        brand: 'Marque',
        all_brands: 'Toutes les marques',
        sort_newest: 'Trier : Nouveautés',
        sort_price_asc: 'Prix : Croissant',
        sort_price_desc: 'Prix : Décroissant',
        sort_rating: 'Mieux notés',
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
