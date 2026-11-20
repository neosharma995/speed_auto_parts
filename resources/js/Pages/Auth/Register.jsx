import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Create Account | AUTO PARTS" />

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#151515', textTransform: 'uppercase' }}>
                    Create Account
                </h1>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>
                    Join the driver community for verified vehicle fitment and express shipping.
                </p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                        autoComplete="name"
                        required
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address <span className="required">*</span></label>
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
                    <label className="form-label">Phone Number (Optional)</label>
                    <input
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                        autoComplete="tel"
                        placeholder="+91 98765 00000"
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Password <span className="required">*</span></label>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                        autoComplete="new-password"
                        required
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Confirm Password <span className="required">*</span></label>
                    <input
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={`form-input ${errors.password_confirmation ? 'form-input--error' : ''}`}
                        autoComplete="new-password"
                        required
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    {errors.password_confirmation && (
                        <span className="form-error">{errors.password_confirmation}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-full"
                    disabled={processing}
                    style={{ marginTop: '8px' }}
                >
                    <UserPlus size={18} /> {processing ? 'Creating Account...' : 'Register'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#666' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#F36B16', fontWeight: 700 }}>
                        Sign In Here
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
