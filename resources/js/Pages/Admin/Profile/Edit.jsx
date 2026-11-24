import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { User, Mail, Phone, Shield, Lock, Save } from 'lucide-react';

export default function AdminProfileEdit({ profile = {} }) {
    const { errors } = usePage().props;

    const [name, setName] = useState(profile.name || '');
    const [email, setEmail] = useState(profile.email || '');
    const [phone, setPhone] = useState(profile.phone || '');
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setSavingProfile(true);
        router.put(
            '/admin/profile',
            { name, email, phone },
            {
                preserveScroll: true,
                onFinish: () => setSavingProfile(false),
            }
        );
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setSavingPassword(true);
        router.put(
            '/admin/profile/password',
            {
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCurrentPassword('');
                    setPassword('');
                    setPasswordConfirmation('');
                },
                onFinish: () => setSavingPassword(false),
            }
        );
    };

    const roleLabel = Array.isArray(profile.roles) && profile.roles.length > 0
        ? profile.roles.join(', ')
        : 'Staff';

    return (
        <AdminLayout title="My Profile">
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '24px',
                    alignItems: 'start',
                }}
            >
                {/* Profile Information Card */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Profile Information</h3>
                    </div>
                    <div className="admin-card-body">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '16px',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(243, 107, 22, 0.12)',
                                    color: '#F36B16',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <User size={24} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                                    {profile.name || 'Administrator'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                                    {profile.email}
                                </div>
                                <div style={{ marginTop: '6px' }}>
                                    <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                                        <Shield size={11} style={{ marginRight: '4px' }} />
                                        {roleLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Full Name <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: '36px' }}
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                {errors?.name && (
                                    <span style={{ fontSize: '12px', color: '#D93025' }}>{errors.name}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Email Address <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="email"
                                        className="form-input"
                                        style={{ paddingLeft: '36px' }}
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {errors?.email && (
                                    <span style={{ fontSize: '12px', color: '#D93025' }}>{errors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: '36px' }}
                                        placeholder="e.g. +971 4 512 8900"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                {errors?.phone && (
                                    <span style={{ fontSize: '12px', color: '#D93025' }}>{errors.phone}</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                                    <Save size={15} />
                                    {savingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Change Password</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Current Password <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="password"
                                        className="form-input"
                                        style={{ paddingLeft: '36px' }}
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                {errors?.current_password && (
                                    <span style={{ fontSize: '12px', color: '#D93025' }}>
                                        {errors.current_password}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    New Password <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="password"
                                        className="form-input"
                                        style={{ paddingLeft: '36px' }}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {errors?.password && (
                                    <span style={{ fontSize: '12px', color: '#D93025' }}>{errors.password}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Confirm New Password <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94A3B8',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <input
                                        type="password"
                                        className="form-input"
                                        style={{ paddingLeft: '36px' }}
                                        required
                                        minLength={8}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                                    <Lock size={15} />
                                    {savingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
