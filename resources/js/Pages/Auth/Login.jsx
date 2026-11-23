import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { LogIn, Key, Mail, AlertCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
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
        <GuestLayout>
            <Head title="Admin Sign In | Speed Autos Parts" />

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#151515', textTransform: 'uppercase' }}>
                    Admin Sign In
                </h1>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>
                    Sign in to manage products, orders, and store operations.
                </p>
            </div>

            {/* Quick Demo Login Filler */}
            <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #DCDCDC',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Quick Admin Demo:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                        type="button" 
                        onClick={fillDemo}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: '11px' }}
                    >
                        Fill Admin Demo
                    </button>
                </div>
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
                        autoComplete="username"
                        required
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Password</label>
                        {canResetPassword && (
                            <Link href="/forgot-password" style={{ fontSize: '12px', color: '#F36B16', fontWeight: 600 }}>
                                Forgot Password?
                            </Link>
                        )}
                    </div>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                        autoComplete="current-password"
                        required
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        id="remember"
                        onChange={(e) => setData('remember', e.target.checked)}
                        style={{ accentColor: '#F36B16' }}
                    />
                    <label htmlFor="remember" style={{ fontSize: '13px', color: '#444', cursor: 'pointer' }}>
                        Remember me on this browser
                    </label>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-full"
                    disabled={processing}
                    style={{ marginTop: '8px' }}
                >
                    <LogIn size={18} /> {processing ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </GuestLayout>
    );
}
