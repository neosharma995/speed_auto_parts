import React from 'react';
import { Link } from '@inertiajs/react';
import { Wrench } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#151515',
            padding: '24px 16px',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', textDecoration: 'none' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    backgroundColor: '#F36B16',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Wrench size={22} />
                </div>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    AUTOS<span style={{ color: '#F36B16' }}>PARTS</span>
                </span>
            </Link>

            <div style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '36px 32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
                {children}
            </div>

            <span style={{ color: '#666', fontSize: '12px', marginTop: '24px' }}>
                © {new Date().getFullYear()} SPEED AUTOS PARTS E-Commerce Platform. All rights reserved.
            </span>
        </div>
    );
}
