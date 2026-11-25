import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <GuestLayout mode="forgot" switchHref="/login" switchLabel="Sign In" switchText="Remember your credentials?">
            <Head title="Reset Password | SPEED AUTOS PARTS" />

            {/* Header */}
            <div className="auth-form-card-header">
                <h2 className="auth-form-card-title">Reset Password</h2>
                <p className="auth-form-card-subtitle">
                    Enter your registered email address and we'll send you a password reset link.
                </p>
            </div>

            {status && (
                <div style={{ color: '#168A35', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
                    {status}
                </div>
            )}

            {/* Form */}
            <form onSubmit={submit}>
                {/* Email Address */}
                <div className="auth-form-group">
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <Mail size={16} />
                        </span>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={data.email}
                            className={`auth-input auth-input--no-action ${errors.email ? 'auth-input--error' : ''}`}
                            autoComplete="email"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    {errors.email && <span className="auth-form-error">{errors.email}</span>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={processing}
                    style={{ marginTop: '8px' }}
                >
                    <ArrowRight size={18} />
                    <span>{processing ? 'Sending Link...' : 'Email Reset Link'}</span>
                </button>

                {/* Footer Switch Prompt */}
                <div className="auth-footer-prompt" style={{ marginTop: '24px' }}>
                    <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
