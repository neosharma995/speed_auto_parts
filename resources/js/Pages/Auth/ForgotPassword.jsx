import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword({ status }) {
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState(status || '');
    const [localErrors, setLocalErrors] = useState({});
    const [resendCooldown, setResendCooldown] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

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
            const res = await axios.post('/forgot-password', {
                email: data.email,
            });

            if (res.data.success) {
                setOtpMessage(res.data.message || 'Password reset OTP sent to your email.');
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
                    general: err.response?.data?.message || 'Unable to send reset OTP email. Please try again.',
                });
            }
        } finally {
            setSendingOtp(false);
        }
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        setLocalErrors({});
        post('/forgot-password/reset');
    };

    return (
        <GuestLayout mode="forgot" switchHref="/login" switchLabel="Sign In" switchText="Remember your credentials?">
            <Head title="Reset Password | SPEED AUTOS PARTS" />

            {/* Header */}
            <div className="auth-form-card-header">
                <h2 className="auth-form-card-title">
                    {step === 'otp' ? 'Enter OTP & New Password' : 'Reset Password'}
                </h2>
                <p className="auth-form-card-subtitle">
                    {step === 'otp'
                        ? `Enter the 6-digit OTP sent to ${data.email} along with your new password.`
                        : "Enter your registered email address and we'll send you a 6-digit OTP to reset your password."}
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

            {otpMessage && (
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

            {step === 'email' ? (
                <form onSubmit={handleSendOtp}>
                    {/* Email Address */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Mail size={16} />
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Registered Email Address *"
                                value={data.email}
                                className={`auth-input auth-input--no-action ${mergedErrors.email ? 'auth-input--error' : ''}`}
                                autoComplete="email"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        {mergedErrors.email && <span className="auth-form-error">{mergedErrors.email}</span>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={sendingOtp}
                        style={{ marginTop: '8px' }}
                    >
                        <ArrowRight size={18} />
                        <span>{sendingOtp ? 'Sending OTP...' : 'Send Reset OTP'}</span>
                    </button>

                    {/* Footer Switch Prompt */}
                    <div className="auth-footer-prompt" style={{ marginTop: '24px' }}>
                        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ArrowLeft size={14} /> Back to Sign In
                        </Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    {/* 6-Digit OTP */}
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
                                placeholder="6-Digit Email OTP *"
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

                    {/* New Password */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Lock size={16} />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="New Password *"
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

                    {/* Confirm New Password */}
                    <div className="auth-form-group">
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon">
                                <Lock size={16} />
                            </span>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                placeholder="Confirm New Password *"
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

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing || data.otp.length !== 6}
                        style={{ marginTop: '8px' }}
                    >
                        <ArrowRight size={18} />
                        <span>{processing ? 'Resetting Password...' : 'Verify OTP & Reset Password'}</span>
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
                                setStep('email');
                                setLocalErrors({});
                                setOtpMessage('');
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
                            <ArrowLeft size={14} /> Change Email
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
