import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Hero from '@/Components/Hero';
import ProductCard from '@/Components/ProductCard';
import { useLanguage } from '@/Context/LanguageContext';
import {
    ArrowRight,
    Truck,
    ShieldCheck,
    RefreshCw,
    Headphones,
    Users,
    Package,
    Globe,
    Star,
    CheckCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

function StatCounter({ value, suffix = '', decimals = 0, isVisible, duration = 1800 }) {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        let startTimestamp = null;
        let animationFrameId;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = easeOut * value;
            setDisplayVal(current);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                setDisplayVal(value);
            }
        };

        animationFrameId = requestAnimationFrame(step);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isVisible, value, duration]);

    if (!isVisible) {
        return <span>0{suffix}</span>;
    }

    const formatted = decimals > 0
        ? displayVal.toFixed(decimals)
        : Math.floor(displayVal).toLocaleString();

    return <span>{formatted}{suffix}</span>;
}

export default function Welcome({
    categories = [],
    featuredProducts = [],
    bestSellers = [],
    newArrivals = [],
    brands = []
}) {
    const { t, localize } = useLanguage();
    const [activeTab, setActiveTab] = useState('All');
    const [countersVisible, setCountersVisible] = useState(false);
    const resultsSectionRef = useRef(null);
    const topPicksGridRef = useRef(null);

    const scrollTopPicks = (dir) => {
        const el = topPicksGridRef.current;
        if (!el) return;
        const step = el.clientWidth * 0.8;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!resultsSectionRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCountersVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(resultsSectionRef.current);
        return () => observer.disconnect();
    }, []);

    // 8 Popular Categories — prefer DB categories (with translations), fill remaining slots with localized defaults
    const fallbackCategories = [
        { name: 'Tires', slug: 'tires', image: '/assets/images/categories/tires.webp', translations: { ar: { name: 'الإطارات' }, fr: { name: 'Pneus' } } },
        { name: 'Brakes', slug: 'brakes', image: '/assets/images/categories/brakes.webp', translations: { ar: { name: 'الفرامل' }, fr: { name: 'Freins' } } },
        { name: 'Exhaust', slug: 'exhaust', image: '/assets/images/categories/exhaust.webp', translations: { ar: { name: 'العادم' }, fr: { name: 'Échappement' } } },
        { name: 'Intake', slug: 'intake', image: '/assets/images/categories/intake.webp', translations: { ar: { name: 'سحب الهواء' }, fr: { name: 'Admission' } } },
        { name: 'Suspension', slug: 'suspension', image: '/assets/images/categories/suspension.webp', translations: { ar: { name: 'نظام التعليق' }, fr: { name: 'Suspension' } } },
        { name: 'Engine', slug: 'engine', image: '/assets/images/categories/engine.webp', translations: { ar: { name: 'المحرك' }, fr: { name: 'Moteur' } } },
        { name: 'Cooling', slug: 'cooling', image: '/assets/images/categories/cooling.webp', translations: { ar: { name: 'التبريد' }, fr: { name: 'Refroidissement' } } },
        { name: 'Lighting', slug: 'lighting', image: '/assets/images/categories/lighting.webp', translations: { ar: { name: 'الإضاءة' }, fr: { name: 'Éclairage' } } },
    ];
    const dbCategoriesBySlug = Object.fromEntries((categories || []).map((c) => [c.slug, c]));
    const popularCategories = fallbackCategories.map((fb) => {
        const dbCat = dbCategoriesBySlug[fb.slug];
        if (!dbCat) return fb;
        return {
            ...fb,
            ...dbCat,
            image: dbCat.image && (dbCat.image.startsWith('/assets/') || dbCat.image.startsWith('/storage/') || dbCat.image.startsWith('http'))
                ? dbCat.image
                : fb.image,
            translations: dbCat.translations || fb.translations,
        };
    });

    // Featured Products — use DB featuredProducts when available (with translations), fallback to defaults
    const mockupProducts = [
        {
            id: 1,
            name: 'Pilot Sport 5 Performance Tire',
            slug: 'pilot-sport-5-performance-tire',
            category: 'Tires',
            brand: { name: 'MICHELIN' },
            short_description: 'High-performance tire for maximum grip and control.',
            main_image: '/assets/images/products/performance-tire.webp',
            base_price: 244.99,
            effective_price: 219.99,
            discount_percentage: 10,
            rating: 4.8,
            rating_count: 124,
            is_in_stock: true,
        },
        {
            id: 2,
            name: 'Slotted & Drilled Brake Rotor',
            slug: 'slotted-drilled-brake-rotor',
            category: 'Brakes',
            brand: { name: 'BREMBO' },
            short_description: 'Enhanced stopping power and heat dissipation.',
            main_image: '/assets/images/products/brake-rotor.webp',
            base_price: 189.99,
            effective_price: 189.99,
            discount_percentage: 0,
            rating: 4.9,
            rating_count: 87,
            is_in_stock: true,
        },
        {
            id: 3,
            name: 'Performance Cat-Back Exhaust',
            slug: 'performance-cat-back-exhaust',
            category: 'Exhaust',
            brand: { name: 'BORLA' },
            short_description: 'Stainless steel system with deep, aggressive sound.',
            main_image: '/assets/images/products/performance-exhaust.webp',
            base_price: 959.99,
            effective_price: 849.99,
            discount_percentage: 12,
            rating: 4.7,
            rating_count: 56,
            is_in_stock: true,
        },
        {
            id: 4,
            name: 'Cold-Air Intake System',
            slug: 'cold-air-intake-system',
            category: 'Intake',
            brand: { name: 'K&N' },
            short_description: 'Increases horsepower and throttle response.',
            main_image: '/assets/images/products/cold-air-intake.webp',
            base_price: 329.99,
            effective_price: 329.99,
            discount_percentage: 0,
            rating: 4.8,
            rating_count: 102,
            is_in_stock: true,
        },
        {
            id: 5,
            name: 'B16 PSS10 Coilover Suspension Kit',
            slug: 'b16-pss10-coilover-suspension-kit',
            category: 'Suspension',
            brand: { name: 'BILSTEIN' },
            short_description: 'Adjustable damping and ride height for track precision.',
            main_image: '/assets/images/products/coilover-suspension.webp',
            base_price: 1499.99,
            effective_price: 1299.99,
            discount_percentage: 13,
            rating: 4.9,
            rating_count: 64,
            is_in_stock: true,
        },
    ];

    const sourceFeaturedProducts = Array.isArray(featuredProducts) && featuredProducts.length > 0
        ? featuredProducts
        : mockupProducts;

    const displayProducts = activeTab === 'All'
        ? sourceFeaturedProducts
        : sourceFeaturedProducts.filter((p) => {
            const catName = typeof p.category === 'object' ? p.category?.name : p.category;
            const catSlug = typeof p.category === 'object' ? p.category?.slug : p.category;
            return (
                String(catName || '').toLowerCase() === activeTab.toLowerCase() ||
                String(catSlug || '').toLowerCase() === activeTab.toLowerCase()
            );
        });

    // 5 Vehicle types
    const vehicleTypes = [
        { name: t('vt_cars'), slug: 'cars', img: '/assets/images/vehicles/cars.webp' },
        { name: t('vt_suvs'), slug: 'suvs', img: '/assets/images/vehicles/suvs.webp' },
        { name: t('vt_trucks'), slug: 'trucks', img: '/assets/images/vehicles/trucks.webp' },
        { name: t('vt_vans'), slug: 'vans', img: '/assets/images/vehicles/vans.webp' },
        { name: t('vt_motorcycles'), slug: 'motorcycles', img: '/assets/images/vehicles/motorcycles.webp' },
    ];

    // 8 Popular Brands with official SVG marks
    const brandLogos = [
        { name: 'Brembo', slug: 'brembo', logo: '/assets/icons/brembo.svg' },
        { name: 'Michelin', slug: 'michelin', logo: '/assets/icons/michelin.svg' },
        { name: 'Borla', slug: 'borla', logo: '/assets/icons/borla.svg' },
        { name: 'K&N', slug: 'k-and-n', logo: '/assets/icons/kn.svg' },
        { name: 'Bilstein', slug: 'bilstein', logo: '/assets/icons/bilstein.svg' },
        { name: 'Garrett', slug: 'garrett', logo: '/assets/icons/garrett.svg' },
        { name: 'Akrapovic', slug: 'akrapovic', logo: '/assets/icons/akrapovic.svg' },
        { name: 'BBS', slug: 'bbs', logo: '/assets/icons/bbs.svg' },
    ];

    // Top picks for your build
    const topPicks = [
        { title: t('tp_brakes'), slug: 'brakes', img: '/assets/images/categories/brakes.webp' },
        { title: t('tp_intakes'), slug: 'intake', img: '/assets/images/categories/intake.webp' },
        { title: t('tp_coilovers'), slug: 'suspension', img: '/assets/images/categories/suspension.webp' },
        { title: t('tp_exhaust'), slug: 'exhaust', img: '/assets/images/categories/exhaust.webp' },
    ];

    return (
        <AppLayout title="Performance Automotive Spare Parts">
            {/* 1 & 2. Hero Section with Attached Vehicle Finder (Unified Card in 1720px Container) */}
            <Hero />

            {/* 3. Popular Categories Section */}
            <section className="section popular-categories-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-header-left">
                            <h2 className="section-header-title">
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> {t('popular_categories')}
                            </h2>
                        </div>
                        <Link href="/categories" className="section-header-link">
                            {t('view_all_categories')} <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div className="categories-grid-8">
                        {popularCategories.map((cat, idx) => (
                            <Link
                                key={idx}
                                href={`/shop?category=${cat.slug}`}
                                className="cat-card-item"
                            >
                                <div className="cat-thumb-wrap">
                                    <img
                                        src={cat.image}
                                        alt={localize(cat, 'name')}
                                        loading="lazy"
                                    />
                                </div>
                                <span className="cat-name">{localize(cat, 'name')}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Featured Products Section */}
            <section className="section featured-products-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-header-left">
                            <h2 className="section-header-title">
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> {t('featured_products')}
                            </h2>
                        </div>
                        <div className="filter-tabs">
                            {['All', 'Tires', 'Brakes', 'Exhaust', 'Intake', 'Suspension'].map(tab => {
                                const tabCat = popularCategories.find((c) => c.slug === tab.toLowerCase());
                                const tabLabel = tab === 'All' ? t('all') : (tabCat ? localize(tabCat, 'name') : tab);
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tabLabel}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="product-grid">
                        {displayProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. 3 Promotional Banners Grid */}
            <section className="section promo-banners-section">
                <div className="container">
                    <div className="promo-banners-grid">
                        {/* Promo Card 1: Tires */}
                        <div className="promo-banner-card">
                            <div className="promo-content">
                                <span className="promo-eyebrow">{t('promo_up_to')}</span>
                                <h3 className="promo-highlight">{t('promo_20_off')}</h3>
                                <p className="promo-sub">{t('promo_tires_sub')}</p>
                                <Link href="/shop?category=tires" className="btn btn-primary promo-btn">
                                    {t('promo_shop_tires')} <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="promo-thumb-wrap">
                                <img
                                    src="/assets/images/promotions/tire-promotion.webp"
                                    alt={t('promo_tires_sub')}
                                    className="promo-thumb"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {/* Promo Card 2: Brakes */}
                        <div className="promo-banner-card">
                            <div className="promo-content">
                                <h3 className="promo-heading-white">{t('promo_brakes_title')}</h3>
                                <p className="promo-discount-orange">{t('promo_save_15')}</p>
                                <Link href="/shop?category=brakes" className="btn btn-primary promo-btn">
                                    {t('promo_shop_brakes')} <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="promo-thumb-wrap">
                                <img
                                    src="/assets/images/promotions/brake-promotion.webp"
                                    alt={t('promo_brakes_title')}
                                    className="promo-thumb"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {/* Promo Card 3: Engine */}
                        <div className="promo-banner-card">
                            <div className="promo-content">
                                <h3 className="promo-heading-white">{t('promo_engine_title')}</h3>
                                <p className="promo-desc-grey">{t('promo_engine_sub')}</p>
                                <Link href="/shop?category=intake" className="btn btn-primary promo-btn">
                                    {t('promo_shop_engine')} <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="promo-thumb-wrap">
                                <img
                                    src="/assets/images/promotions/engine-promotion.webp"
                                    alt={t('promo_engine_title')}
                                    className="promo-thumb"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Shop by Vehicle Type */}
            <section className="section vehicle-types-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-header-left">
                            <h2 className="section-header-title">
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> {t('shop_by_vehicle_type')}
                            </h2>
                        </div>
                        <Link href="/vehicle-finder" className="section-header-link">
                            {t('view_all_vehicle_types')} <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div className="vehicle-types-grid">
                        {vehicleTypes.map((vt, idx) => (
                            <Link
                                key={idx}
                                href={`/shop?vehicle_type=${vt.slug}`}
                                className="vt-card"
                            >
                                <div className="vt-img-wrap">
                                    <img
                                        src={vt.img}
                                        alt={vt.name}
                                        className="vt-img"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="vt-footer">
                                    <span className="vt-name">{vt.name}</span>
                                    <div className="vt-arrow-btn">
                                        <ArrowRight size={13} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Popular Brands Row */}
            <section className="section popular-brands-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-header-left">
                            <h2 className="section-header-title">
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> {t('popular_brands')}
                            </h2>
                        </div>
                        <Link href="/brands" className="section-header-link">
                            {t('view_all_brands')} <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div className="brands-row-8">
                        {brandLogos.map((brand, idx) => (
                            <Link
                                key={idx}
                                href={`/shop?brand=${brand.slug}`}
                                className="brand-logo-card"
                                title={brand.name}
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="brand-logo-img"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Why Choose Speed Autos Parts Strip */}
            <section className="section why-choose-section">
                <div className="container">
                    <div className="why-choose-card">
                        <div className="why-choose-brand-col">
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="wc-brand-stripe" />
                            <div className="wc-brand-title">
                                <span>{t('why_choose')}</span>
                                <span>{t('why_choose_brand')}</span>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <ShieldCheck size={34} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>{t('wc_genuine_title')}</h4>
                                <p>{t('wc_genuine_desc')}</p>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <Truck size={34} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>{t('wc_shipping_title')}</h4>
                                <p>{t('wc_shipping_desc')}</p>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <RefreshCw size={30} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>{t('wc_returns_title')}</h4>
                                <p>{t('wc_returns_desc')}</p>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <Headphones size={32} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>{t('wc_support_title')}</h4>
                                <p>{t('wc_support_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Top Picks for Your Build */}
            <section className="section top-picks-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-header-left">
                            <h2 className="section-header-title">
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> {t('top_picks_title')}
                            </h2>
                        </div>
                        <div className="top-picks-header-right">
                            <Link href="/shop" className="section-header-link">
                                {t('view_all')} <ArrowRight size={15} />
                            </Link>

                            <div className="slider-nav-arrows">
                                <button type="button" className="slider-arrow-btn prev" aria-label="Previous" onClick={() => scrollTopPicks(-1)}>
                                    <ChevronLeft size={16} />
                                </button>
                                <button type="button" className="slider-arrow-btn next" aria-label="Next" onClick={() => scrollTopPicks(1)}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="top-picks-slider-wrap">
                        <div className="top-picks-grid" ref={topPicksGridRef}>
                            {topPicks.map((pick, idx) => (
                                <Link
                                    key={idx}
                                    href={`/shop?category=${pick.slug}`}
                                    className="top-pick-card"
                                >
                                    <div className="tp-img-wrap">
                                        <img
                                            src={pick.img}
                                            alt={pick.title}
                                            className="tp-thumb"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="tp-footer">
                                        <span className="tp-name">{pick.title}</span>
                                        <div className="tp-arrow-btn">
                                            <ArrowRight size={13} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. Real Results Banner (Built by Enthusiasts Trusted Worldwide) */}
            <section className="section real-results-section" ref={resultsSectionRef}>
                <div className="container">
                    <div className="real-results-card">
                        <div className="rr-left">
                            <div className="rr-eyebrow">
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                                <span>{t('rr_eyebrow')}</span>
                            </div>
                            <h2 className="rr-heading">
                                {t('rr_heading_line1')}<br />{t('rr_heading_line2')}
                            </h2>
                            <p className="rr-desc">
                                {t('rr_desc')}
                            </p>
                            <Link href="/shop" className="btn btn-primary rr-btn">
                                {t('rr_cta')} <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="rr-center-car">
                            <img
                                src="/assets/images/customer/customer-builds.webp"
                                alt={t('rr_cta')}
                                className="rr-car-img"
                                loading="lazy"
                            />
                        </div>

                        <div className="rr-stats-row">
                            <div className="rr-stat-col">
                                <Users size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={100000} suffix="+" isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">{t('rr_happy_customers')}</span>
                            </div>

                            <div className="rr-stat-divider" />

                            <div className="rr-stat-col">
                                <Package size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={250000} suffix="+" isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">{t('rr_parts_in_stock')}</span>
                            </div>

                            <div className="rr-stat-divider" />

                            <div className="rr-stat-col">
                                <Globe size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={100} suffix="+" isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">{t('rr_countries_served')}</span>
                            </div>

                            <div className="rr-stat-divider" />

                            <div className="rr-stat-col">
                                <Star size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={4.8} suffix="/5" decimals={1} isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">{t('rr_customer_rating')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
