import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Hero from '@/Components/Hero';
import VehicleFinder from '@/Components/VehicleFinder';
import CategoryStrip from '@/Components/CategoryStrip';
import PartNumberSearch from '@/Components/PartNumberSearch';
import ProductCard from '@/Components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, Star, CheckCircle } from 'lucide-react';

export default function Welcome({ 
    heroBanner, 
    categories = [], 
    featuredProducts = [], 
    bestSellers = [], 
    newArrivals = [],
    brands = [] 
}) {
    return (
        <AppLayout title="Performance Automotive Spare Parts">
            {/* 1. Hero Section */}
            <Hero banner={heroBanner} />

            {/* 2. Vehicle Parts Finder (Directly below hero) */}
            <VehicleFinder />

            {/* 3. Featured Categories Horizontal Strip */}
            <section className="section bg-white" style={{ paddingBottom: '32px' }}>
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Precision Engineered
                            </span>
                            <h2 className="section-header-title">Featured Categories</h2>
                        </div>
                        <Link href="/categories" className="section-header-link">
                            All Categories <ArrowRight size={16} />
                        </Link>
                    </div>

                    <CategoryStrip categories={categories} />
                </div>
            </section>

            {/* 4. Search by Part Number */}
            <PartNumberSearch />

            {/* 5. Featured Products */}
            <section className="section bg-white">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Hand-Picked Performance
                            </span>
                            <h2 className="section-header-title">Featured Products</h2>
                        </div>
                        <Link href="/shop" className="section-header-link">
                            View All Products <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="product-grid">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Features Strip */}
            <section className="features-strip">
                <div className="container">
                    <div className="features-strip-grid">
                        <div className="features-strip-item">
                            <div className="feature-icon">
                                <Truck size={24} />
                            </div>
                            <div className="feature-text">
                                <h4>Express Ground Shipping</h4>
                                <p>Fast and insured transit across all Indian pin codes.</p>
                            </div>
                        </div>

                        <div className="features-strip-item">
                            <div className="feature-icon">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="feature-text">
                                <h4>100% Guaranteed Fitment</h4>
                                <p>Verified vehicle compatibility with direct bolt-on specs.</p>
                            </div>
                        </div>

                        <div className="features-strip-item">
                            <div className="feature-icon">
                                <Headphones size={24} />
                            </div>
                            <div className="feature-text">
                                <h4>Expert Technical Support</h4>
                                <p>Dedicated automotive engineers for build guidance.</p>
                            </div>
                        </div>

                        <div className="features-strip-item">
                            <div className="feature-icon">
                                <RotateCcw size={24} />
                            </div>
                            <div className="feature-text">
                                <h4>30-Day Hassle-Free Returns</h4>
                                <p>Unopened components returned with quick refund processing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Best Sellers */}
            {bestSellers.length > 0 && (
                <section className="section bg-light">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Track Proven & Street Tested
                                </span>
                                <h2 className="section-header-title">Best Sellers</h2>
                            </div>
                            <Link href="/shop?filter=best_seller" className="section-header-link">
                                Shop Best Sellers <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="product-grid">
                            {bestSellers.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 7. Popular Brands */}
            {brands.length > 0 && (
                <section className="section bg-white">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Certified Manufacturers
                                </span>
                                <h2 className="section-header-title">Popular Brands</h2>
                            </div>
                            <Link href="/brands" className="section-header-link">
                                View All Brands <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="brand-grid">
                            {brands.map(brand => (
                                <Link 
                                    key={brand.id} 
                                    href={`/brands/${brand.slug}`} 
                                    className="brand-grid-item"
                                >
                                    <span>{brand.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. Promotional Build Banner */}
            <section className="container" style={{ marginBottom: '56px' }}>
                <div style={{
                    backgroundColor: '#151515',
                    borderRadius: '8px',
                    padding: '40px',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #333'
                }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Special Build Incentive
                    </span>
                    <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', maxWidth: '600px', lineHeight: 1.2 }}>
                        GET 10% OFF YOUR COMPLETE PERFORMANCE BRAKE & SUSPENSION PACKAGE
                    </h3>
                    <p style={{ color: '#AAAAAA', fontSize: '14px', maxWidth: '500px' }}>
                        Use code <strong style={{ color: '#F36B16' }}>SPEED10</strong> at checkout on eligible orders above ₹5,000. Verified for track day enthusiasts.
                    </p>
                    <Link href="/shop" className="btn btn-primary btn-lg">
                        Shop Eligible Parts <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}
