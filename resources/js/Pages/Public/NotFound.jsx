import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function NotFound() {
    const { t } = useLanguage();
    const handleGoBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <AppLayout title={`404 - ${t('nf_page_not')} ${t('nf_found')}`} showHeader={false} showFooter={false}>
            <div className="not-found-page">
                <div className="container not-found-inner">
                    <div className="not-found-content">
                        <div className="not-found-number-wrapper">
                            <span className="not-found-number">404</span>
                        </div>

                        <h1 className="not-found-title">
                            {t('nf_page_not')} <span className="title-orange">{t('nf_found')}</span>
                        </h1>

                        <p className="not-found-description">
                            {t('nf_desc')}
                        </p>

                        <div className="not-found-action">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                className="btn hero-secondary-btn btn-go-back"
                            >
                                <ArrowLeft size={16} />
                                <span>{t('nf_go_back')}</span>
                            </button>

                            <Link href="/" className="btn btn-primary btn-back-home">
                                <Home size={16} />
                                <span>{t('nf_back_home')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
