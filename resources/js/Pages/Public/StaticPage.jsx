import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function StaticPage({ title, subtitle, content }) {
    return (
        <AppLayout title={title}>
            <div className="section bg-light" style={{ minHeight: '75vh', padding: '56px 0' }}>
                <div className="container-narrow">
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DCDCDC',
                        borderRadius: '8px',
                        padding: '40px'
                    }}>
                        <div style={{ borderBottom: '1px solid #EEE', paddingBottom: '20px', marginBottom: '28px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                AUTO PARTS Store Policy
                            </span>
                            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#151515', marginTop: '4px' }}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '6px' }}>{subtitle}</p>
                            )}
                        </div>

                        <div 
                            style={{ fontSize: '14px', color: '#333', lineHeight: 1.8 }}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
