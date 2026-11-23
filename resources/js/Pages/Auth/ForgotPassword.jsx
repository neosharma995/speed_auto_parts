import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password | Speed Autos Parts" />

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#151515', textTransform: 'uppercase' }}>
                    Reset Password
                </h1>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>
                    Enter your registered email address and we'll send you a password reset link.
                </p>
            </div>

            {status && (
                <div style={{ color: '#168A35', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                        autoComplete="email"
                        required
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-full"
                    disabled={processing}
                >
                    <Mail size={16} /> {processing ? 'Sending Link...' : 'Email Password Reset Link'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <Link href="/login" style={{ fontSize: '13px', color: '#666', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
