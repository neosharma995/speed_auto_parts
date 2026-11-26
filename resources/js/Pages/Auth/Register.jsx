import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function Register() {
    const [step, setStep] = useState('details'); // 'details' | 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [localErrors, setLocalErrors] = useState({});
    const [resendCooldown, setResendCooldown] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        otp: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation', 'otp');
        };
    }, []);

    useEffect(() => {
        if (resendCooldown <= 0) return undefined;
        const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const mergedErrors = { ...localErrors, ...errors };

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setLocalErrors({});
        setOtpMessage('');
        setSendingOtp(true);

        try {
            const res = await axios.post('/register/send-otp', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            if (res.data.success) {
                setOtpMessage(res.data.message || 'Verification OTP sent to your email.');
                setStep('otp');
                setResendCooldown(30);
            }
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const flat = {};
                Object.entries(err.response.data.errors).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : v;
                });
                setLocalErrors(flat);
            } else {
                setLocalErrors({
                    general: err.response?.data?.message || 'Unable to send verification OTP. Please try again.',
                });
            }
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyAndRegister = (e) => {
        e.preventDefault();
        setLocalErrors({});
        post('/register');
    };

    return (
        <GuestLayout mode="register">
            <Head title="Create Account | SPEED AUTOS PARTS" />

            {/* Header */}
            <div className="auth-form-card-header">
                <h2 className="auth-form-card-title">
                    {step === 'otp' ? 'Verify Your Email' : 'Create Account'}
                </h2>
                <p className="auth-form-card-subtitle">
                    {step === 'otp'
                        ? `Enter the 6-digit OTP sent to ${data.email}`
                        : 'Sign up for your SpeedAutoParts account'}
                </p>
            </div>

            {mergedErrors.general && (
                <div
                    style={{
                        backgroundColor: '#FFF1F2',
                        color: '#D93025',
                        border: '1px solid #FECDD3',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '14px',
                    }}
                >
                    {mergedErrors.general}
                </div>
            )}

            {otpMessage && step === 'otp' && (
                <div
                    style={{
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '14px',
                    }}
                >
                    {otpMessage}
                </div>
            )}

            {step === 'details' ? (
                <form onSubmit={handleSendOtp}>
                    {/* Full Name */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <User size={16} />
                            </span>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name *"
                                value={data.name}
                                className={`auth-input auth-input--no-action ${mergedErrors.name ? 'auth-input--error' : ''}`}
                                autoComplete="name"
                                required
                                onChange={(e) => setData('name', e.target.value)}
                            />
                        </div>
                        {mergedErrors.name && <span className="auth-form-error">{mergedErrors.name}</span>}
                    </div>

                    {/* Email Address */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Mail size={16} />
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address *"
                                value={data.email}
                                className={`auth-input auth-input--no-action ${mergedErrors.email ? 'auth-input--error' : ''}`}
                                autoComplete="username"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        {mergedErrors.email && <span className="auth-form-error">{mergedErrors.email}</span>}
                    </div>

                    {/* Phone Number (Optional) */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Phone size={16} />
                            </span>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number (Optional)"
                                value={data.phone}
                                className={`auth-input auth-input--no-action ${mergedErrors.phone ? 'auth-input--error' : ''}`}
                                autoComplete="tel"
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                        {mergedErrors.phone && <span className="auth-form-error">{mergedErrors.phone}</span>}
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
                                placeholder="Password *"
                                value={data.password}
                                className={`auth-input ${mergedErrors.password ? 'auth-input--error' : ''}`}
                                autoComplete="new-password"
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
                        {mergedErrors.password && <span className="auth-form-error">{mergedErrors.password}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Lock size={16} />
                            </span>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                placeholder="Confirm Password *"
                                value={data.password_confirmation}
                                className={`auth-input ${mergedErrors.password_confirmation ? 'auth-input--error' : ''}`}
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <button
                                type="button"
                                className="auth-input-action"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {mergedErrors.password_confirmation && (
                            <span className="auth-form-error">{mergedErrors.password_confirmation}</span>
                        )}
                    </div>

                    {/* Send OTP Button */}
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={sendingOtp}
                        style={{ marginTop: '8px' }}
                    >
                        <Mail size={17} />
                        <span>{sendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    </button>

                    {/* Footer Switch Prompt */}
                    <div className="auth-footer-prompt" style={{ marginTop: '20px' }}>
                        Already have an account?{' '}
                        <Link href="/login">
                            Sign In <ArrowRight size={13} />
                        </Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyAndRegister}>
                    {/* 6-Digit OTP Input */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <ShieldCheck size={16} />
                            </span>
                            <input
                                type="text"
                                name="otp"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter 6-Digit Email OTP *"
                                value={data.otp}
                                className={`auth-input auth-input--no-action ${mergedErrors.otp ? 'auth-input--error' : ''}`}
                                style={{ letterSpacing: '6px', fontWeight: 700, fontSize: '16px' }}
                                required
                                autoFocus
                                onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            />
                        </div>
                        {mergedErrors.otp && <span className="auth-form-error">{mergedErrors.otp}</span>}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing || data.otp.length !== 6}
                        style={{ marginTop: '8px' }}
                    >
                        <ArrowRight size={18} />
                        <span>{processing ? 'Verifying & Creating Account...' : 'Verify OTP & Create Account'}</span>
                    </button>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '16px',
                            fontSize: '13px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setStep('details');
                                setLocalErrors({});
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748B',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontWeight: 600,
                            }}
                        >
                            <ArrowLeft size={14} /> Edit Details
                        </button>

                        <button
                            type="button"
                            disabled={sendingOtp || resendCooldown > 0}
                            onClick={handleSendOtp}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: resendCooldown > 0 ? '#94A3B8' : '#F36B16',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontWeight: 700,
                            }}
                        >
                            <RefreshCw size={13} />
                            {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                        </button>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
