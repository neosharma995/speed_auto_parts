import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const handleGoBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <AppLayout title="404 - Page Not Found" showHeader={false} showFooter={false}>
            <div className="not-found-page">
                <div className="container not-found-inner">
                    <div className="not-found-content">
                        <div className="not-found-number-wrapper">
                            <span className="not-found-number">404</span>
                        </div>

                        <h1 className="not-found-title">
                            Page Not <span className="title-orange">Found</span>
                        </h1>

                        <p className="not-found-description">
                            Looks like you've taken a wrong turn. The page you're looking for doesn't exist or has been moved.
                        </p>

                        <div className="not-found-action">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                className="btn hero-secondary-btn btn-go-back"
                            >
                                <ArrowLeft size={16} />
                                <span>Go Back</span>
                            </button>

                            <Link href="/" className="btn btn-primary btn-back-home">
                                <Home size={16} />
                                <span>Back to Homepage</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
