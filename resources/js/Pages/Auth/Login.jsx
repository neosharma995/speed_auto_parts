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

    const fillDemo = () => {
        setData({
            email: 'admin@autoparts.com',
            password: 'password',
            remember: true,
        });
    };

    return (
        <GuestLayout mode="login">
            <Head title="Sign In | SPEED AUTOS PARTS" />

            {/* Header */}
            <div className="auth-form-card-header">
                <h2 className="auth-form-card-title">Welcome Back</h2>
                <p className="auth-form-card-subtitle">
                    Sign in to manage Speed Autos Parts catalog
                </p>
            </div>

            {/* Quick Demo Credentials */}
            <div className="auth-demo-box">
                <span className="auth-demo-box-label">Quick Demo Access:</span>
                <div className="auth-demo-box-chips">
                    <button
                        type="button"
                        onClick={fillDemo}
                        className="auth-demo-box-chip"
                    >
                        Admin Demo
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
            </form>
        </GuestLayout>
    );
}
