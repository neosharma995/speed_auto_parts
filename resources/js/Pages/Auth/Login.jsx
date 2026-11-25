import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login({ status, canResetPassword = true }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillDemo = (role) => {
        if (role === 'admin') {
            setData({
                email: 'admin@autosparts.com',
                password: 'password',
                remember: true,
            });
        } else if (role === 'supplier') {
            setData({
                email: 'supplier@autosparts.com',
                password: 'password',
                remember: true,
            });
        } else {
            setData({
                email: 'customer@autosparts.com',
                password: 'password',
                remember: true,
            });
        }
    };

    return (
        <GuestLayout mode="login">
            <Head title="Sign In | SPEED AUTOS PARTS" />

            {/* Header */}
            <div className="auth-form-card-header">
                <h2 className="auth-form-card-title">Welcome Back</h2>
                <p className="auth-form-card-subtitle">
                    Sign in to your SpeedAutoParts account
                </p>
            </div>

            {/* Quick Demo Credentials */}
            <div className="auth-demo-box">
                <span className="auth-demo-box-label">Quick Demo Access:</span>
                <div className="auth-demo-box-chips">
                    <button
                        type="button"
                        onClick={() => fillDemo('admin')}
                        className="auth-demo-box-chip"
                    >
                        Admin Demo
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemo('supplier')}
                        className="auth-demo-box-chip"
                    >
                        Supplier Demo
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemo('customer')}
                        className="auth-demo-box-chip"
                    >
                        Customer Demo
                    </button>
                </div>
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
                            autoComplete="username"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    {errors.email && <span className="auth-form-error">{errors.email}</span>}
                </div>

                {/* Password */}
                <div className="auth-form-group">
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">
                            <Lock size={16} />
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={data.password}
                            className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                            autoComplete="current-password"
                            required
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            className="auth-input-action"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? 'Hide password' : 'Show password'}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <span className="auth-form-error">{errors.password}</span>}
                </div>

                {/* Meta Row: Remember me + Forgot Password */}
                <div className="auth-meta-row">
                    <label className="auth-checkbox-label">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link href="/forgot-password" className="auth-form-link">
                            Forgot Password?
                        </Link>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={processing}
                >
                    <ArrowRight size={18} />
                    <span>{processing ? 'Signing In...' : 'Sign In'}</span>
                </button>

                {/* Divider */}
                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                {/* Social Login Buttons */}
                <div className="auth-social-row">
                    <button type="button" className="auth-social-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>Google</span>
                    </button>

                    <button type="button" className="auth-social-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 1-3.01-.98.04-2.16.65-2.82 1.43-.59.68-1.1 1.77-1 2.86 1.09.08 2.22-.56 2.82-1.28z" />
                        </svg>
                        <span>Apple</span>
                    </button>
                </div>

                {/* Footer Switch Prompt */}
                <div className="auth-footer-prompt">
                    Don't have an account?{' '}
                    <Link href="/register">
                        Create Account <ArrowRight size={13} />
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
