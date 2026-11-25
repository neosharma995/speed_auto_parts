import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Hero from '@/Components/Hero';
import ProductCard from '@/Components/ProductCard';
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
    const [activeTab, setActiveTab] = useState('All');
    const [countersVisible, setCountersVisible] = useState(false);
    const resultsSectionRef = useRef(null);

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

    // 8 Popular Categories with optimized WebP assets
    const popularCategories = [
        { name: 'Tires', slug: 'tires', image: '/assets/images/categories/tires.webp' },
        { name: 'Brakes', slug: 'brakes', image: '/assets/images/categories/brakes.webp' },
        { name: 'Exhaust', slug: 'exhaust', image: '/assets/images/categories/exhaust.webp' },
        { name: 'Intake', slug: 'intake', image: '/assets/images/categories/intake.webp' },
        { name: 'Suspension', slug: 'suspension', image: '/assets/images/categories/suspension.webp' },
        { name: 'Engine', slug: 'engine', image: '/assets/images/categories/engine.webp' },
        { name: 'Cooling', slug: 'cooling', image: '/assets/images/categories/cooling.webp' },
        { name: 'Lighting', slug: 'lighting', image: '/assets/images/categories/lighting.webp' },
    ];

    // 5 Featured Products matching 5 performance categories
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

    const displayProducts = activeTab === 'All'
        ? mockupProducts
        : mockupProducts.filter(p => p.category?.toLowerCase() === activeTab.toLowerCase());

    // 5 Vehicle types
    const vehicleTypes = [
        { name: 'Cars', slug: 'cars', img: '/assets/images/vehicles/cars.webp' },
        { name: 'SUVs', slug: 'suvs', img: '/assets/images/vehicles/suvs.webp' },
        { name: 'Trucks', slug: 'trucks', img: '/assets/images/vehicles/trucks.webp' },
        { name: 'Vans', slug: 'vans', img: '/assets/images/vehicles/vans.webp' },
        { name: 'Motorcycles', slug: 'motorcycles', img: '/assets/images/vehicles/motorcycles.webp' },
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
        { title: 'Performance Brakes', slug: 'brakes', img: '/assets/images/categories/brakes.webp' },
        { title: 'Cold Air Intakes', slug: 'intake', img: '/assets/images/categories/intake.webp' },
        { title: 'Coilover Kits', slug: 'suspension', img: '/assets/images/categories/suspension.webp' },
        { title: 'Exhaust Systems', slug: 'exhaust', img: '/assets/images/categories/exhaust.webp' },
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
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> Popular Categories
                            </h2>
                        </div>
                        <Link href="/categories" className="section-header-link">
                            View All Categories <ArrowRight size={15} />
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
                                        alt={cat.name}
                                        loading="lazy"
                                    />
                                </div>
                                <span className="cat-name">{cat.name}</span>
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
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> Featured Products
                            </h2>
                        </div>
                        <div className="filter-tabs">
                            {['All', 'Tires', 'Brakes', 'Exhaust', 'Intake', 'Suspension'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
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
                                <span className="promo-eyebrow">UP TO</span>
                                <h3 className="promo-highlight">20% OFF</h3>
                                <p className="promo-sub">On Performance Tires</p>
                                <Link href="/shop?category=tires" className="btn btn-primary promo-btn">
                                    Shop Tires <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="promo-thumb-wrap">
                                <img
                                    src="/assets/images/promotions/tire-promotion.webp"
                                    alt="Performance Tires Promotion"
                                    className="promo-thumb"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {/* Promo Card 2: Brakes */}
                        <div className="promo-banner-card">
                            <div className="promo-content">
                                <h3 className="promo-heading-white">Brake Upgrade Packages</h3>
                                <p className="promo-discount-orange">Save up to 15%</p>
                                <Link href="/shop?category=brakes" className="btn btn-primary promo-btn">
                                    Shop Brakes <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="promo-thumb-wrap">
                                <img
                                    src="/assets/images/promotions/brake-promotion.webp"
                                    alt="Brake Upgrade Packages"
                                    className="promo-thumb"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {/* Promo Card 3: Engine */}
                        <div className="promo-banner-card">
                            <div className="promo-content">
                                <h3 className="promo-heading-white">Engine Performance Parts</h3>
                                <p className="promo-desc-grey">More Power. More Performance.</p>
                                <Link href="/shop?category=intake" className="btn btn-primary promo-btn">
                                    Shop Engine Parts <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="promo-thumb-wrap">
                                <img
                                    src="/assets/images/promotions/engine-promotion.webp"
                                    alt="Engine Performance Tuning"
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
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> Shop by Vehicle Type
                            </h2>
                        </div>
                        <Link href="/vehicle-finder" className="section-header-link">
                            View All Vehicle Types <ArrowRight size={15} />
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
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> Popular Brands
                            </h2>
                        </div>
                        <Link href="/brands" className="section-header-link">
                            View All Brands <ArrowRight size={15} />
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
                                <span>Why Choose</span>
                                <span>Speed Autos Parts?</span>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <ShieldCheck size={34} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>Genuine Parts</h4>
                                <p>100% authentic & certified</p>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <Truck size={34} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>International Shipping</h4>
                                <p>To 100+ countries</p>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <RefreshCw size={30} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>30-Day Returns</h4>
                                <p>Hassle-free & simple</p>
                            </div>
                        </div>

                        <div className="why-choose-item">
                            <div className="wc-icon-wrap">
                                <Headphones size={32} strokeWidth={1.8} />
                            </div>
                            <div className="wc-text">
                                <h4>Expert Support</h4>
                                <p>Automotive specialists</p>
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
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" /> Top Picks for Your Build
                            </h2>
                        </div>
                        <div className="top-picks-header-right">
                            <Link href="/shop" className="section-header-link">
                                View All <ArrowRight size={15} />
                            </Link>

                            <div className="slider-nav-arrows">
                                <button type="button" className="slider-arrow-btn prev" aria-label="Previous">
                                    <ChevronLeft size={16} />
                                </button>
                                <button type="button" className="slider-arrow-btn next" aria-label="Next">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="top-picks-slider-wrap">
                        <div className="top-picks-grid">
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
                                <span>REAL RESULTS</span>
                            </div>
                            <h2 className="rr-heading">
                                BUILT BY ENTHUSIASTS<br />TRUSTED WORLDWIDE
                            </h2>
                            <p className="rr-desc">
                                See how our parts perform in real builds from customers around the globe.
                            </p>
                            <Link href="/shop" className="btn btn-primary rr-btn">
                                Explore Customer Builds <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="rr-center-car">
                            <img
                                src="/assets/images/customer/customer-builds.webp"
                                alt="Customer Performance Build"
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
                                <span className="rr-stat-label">Happy Customers</span>
                            </div>

                            <div className="rr-stat-divider" />

                            <div className="rr-stat-col">
                                <Package size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={250000} suffix="+" isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">Parts In Stock</span>
                            </div>

                            <div className="rr-stat-divider" />

                            <div className="rr-stat-col">
                                <Globe size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={100} suffix="+" isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">Countries Served</span>
                            </div>

                            <div className="rr-stat-divider" />

                            <div className="rr-stat-col">
                                <Star size={26} className="rr-stat-icon" />
                                <span className="rr-stat-num">
                                    <StatCounter value={4.8} suffix="/5" decimals={1} isVisible={countersVisible} />
                                </span>
                                <span className="rr-stat-label">Customer Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
