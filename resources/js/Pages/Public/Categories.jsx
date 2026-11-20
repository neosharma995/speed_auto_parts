import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, ArrowRight } from 'lucide-react';

export default function Categories({ categories = [] }) {
    return (
        <AppLayout title="All Product Categories">
            <div className="section bg-light" style={{ minHeight: '70vh' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Catalog Directory
                        </span>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#151515', marginTop: '4px' }}>
                            PERFORMANCE SPARE CATEGORIES
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', maxWidth: '600px', margin: '8px auto 0' }}>
                            Explore precision replacement components categorized by vehicle system.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {categories.map(cat => (
                            <Link 
                                key={cat.id} 
                                href={`/shop?category=${cat.slug}`} 
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #DCDCDC',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                className="clickable"
                            >
                                <div style={{ height: '180px', backgroundColor: '#151515', overflow: 'hidden' }}>
                                    <img 
                                        src={cat.image || '/images/categories/tires.jpg'} 
                                        alt={cat.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#151515', textTransform: 'uppercase' }}>
                                        {cat.name}
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                                        {cat.description}
                                    </p>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#F36B16', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Browse Products <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
