import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import MobileBottomBar from '@/Components/MobileBottomBar';
import CartDrawer from '@/Components/CartDrawer';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AppLayout({ title, children }) {
    const { flash } = usePage().props;

    return (
        <div className="site-wrap">
            <Head title={title ? `${title} | AUTO PARTS` : 'AUTO PARTS | Performance Spare Parts'} />

            <Header />

            {/* Flash Toaster */}
            {flash?.success && (
                <div style={{
                    backgroundColor: '#EAF5ED',
                    color: '#168A35',
                    borderBottom: '1px solid #A7F3D0',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    zIndex: 999
                }}>
                    <CheckCircle2 size={16} />
                    <span>{flash.success}</span>
                </div>
            )}

            {flash?.error && (
                <div style={{
                    backgroundColor: '#FFF1F2',
                    color: '#D93025',
                    borderBottom: '1px solid #FECDD3',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    zIndex: 999
                }}>
                    <AlertCircle size={16} />
                    <span>{flash.error}</span>
                </div>
            )}

            <main className="main-content">
                {children}
            </main>

            <CartDrawer />
            <MobileBottomBar />
            <Footer />
        </div>
    );
}
