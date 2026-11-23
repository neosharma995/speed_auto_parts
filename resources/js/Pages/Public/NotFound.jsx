import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <AppLayout title="404 - Page Not Found">
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
                            <Link href="/" className="btn btn-primary btn-back-home">
                                <Home size={16} />
                                <span>Back to Homepage &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
