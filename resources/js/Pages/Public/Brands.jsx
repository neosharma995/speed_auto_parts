import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowRight, ExternalLink } from 'lucide-react';

export default function Brands({ brands = [] }) {
    return (
        <AppLayout title="Certified Automotive Brands">
            <div className="section bg-light" style={{ minHeight: '70vh' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Authorized Engineering Partners
                        </span>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#151515', marginTop: '4px' }}>
                            CERTIFIED PERFORMANCE BRANDS
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', maxWidth: '600px', margin: '8px auto 0' }}>
                            We partner directly with leading OEM and motorsport manufacturers for 100% genuine guaranteed spares.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {brands.map(brand => (
                            <div 
                                key={brand.id}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #DCDCDC',
                                    borderRadius: '4px',
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#151515', textTransform: 'uppercase' }}>
                                        {brand.name}
                                    </h3>
                                    {brand.website && (
                                        <a href={brand.website} target="_blank" rel="noreferrer" style={{ color: '#888' }} title="Official Website">
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>

                                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, flex: 1 }}>
                                    {brand.description || 'Premium automotive precision engineering manufacturer.'}
                                </p>

                                <Link 
                                    href={`/shop?brand=${brand.slug}`} 
                                    className="btn btn-primary btn-sm btn-full"
                                    style={{ marginTop: '8px' }}
                                >
                                    View {brand.name} Products <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
