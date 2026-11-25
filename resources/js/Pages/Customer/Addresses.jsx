import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerSidebar from '@/Components/CustomerSidebar';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CustomerAddresses({ addresses = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('Dubai');
    const [state, setState] = useState('Dubai');
    const [pincode, setPincode] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleCreateAddress = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/customer/addresses', {
            full_name: fullName,
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            pincode,
            is_default: isDefault,
        }, {
            onSuccess: () => {
                setShowAddModal(false);
                setFullName('');
                setPhone('');
                setAddressLine1('');
                setAddressLine2('');
                setCity('');
                setPincode('');
                setIsDefault(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDeleteAddress = (id) => {
        if (confirm('Are you sure you want to delete this address?')) {
            router.delete(`/customer/addresses/${id}`);
        }
    };

    const handleSetDefault = (id) => {
        router.post(`/customer/addresses/${id}/default`);
    };

    return (
        <AppLayout title="Saved Addresses">
            <div className="customer-portal">
                <div className="container">
                    <div className="customer-portal-layout">
                        <CustomerSidebar activeTab="addresses" />

                        {/* Content */}
                        <div className="customer-portal-content">
                            <div className="portal-card">
                                <div className="portal-card-header">
                                    <h2>Address Book ({addresses.length})</h2>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        <Plus size={16} /> Add New Address
                                    </button>
                                </div>

                                {addresses.length === 0 ? (
                                    <p style={{ color: '#666', textAlign: 'center', padding: '32px' }}>
                                        No saved delivery addresses. Add your home or garage shipping address for 1-click checkout.
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                        {addresses.map(addr => (
                                            <div key={addr.id} style={{
                                                border: addr.is_default ? '2px solid #F36B16' : '1px solid #DCDCDC',
                                                borderRadius: '4px',
                                                padding: '20px',
                                                backgroundColor: '#FFFFFF',
                                                position: 'relative'
                                            }}>
                                                {addr.is_default && (
                                                    <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
                                                        Default Address
                                                    </span>
                                                )}
                                                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#151515', marginBottom: '6px' }}>
                                                    {addr.full_name}
                                                </h3>
                                                <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>
                                                    {addr.address_line1}<br />
                                                    {addr.address_line2 && <>{addr.address_line2}<br /></>}
                                                    {addr.city}, {addr.state} - {addr.pincode}<br />
                                                    Phone: {addr.phone}
                                                </p>

                                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #EEE' }}>
                                                    {!addr.is_default && (
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleSetDefault(addr.id)}
                                                        >
                                                            Set as Default
                                                        </button>
                                                    )}
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-outline btn-sm"
                                                        style={{ color: '#D93025', borderColor: '#FECDD3' }}
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for adding address */}
            {showAddModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowAddModal(false)} />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '500px',
                        zIndex: 2200,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
                            Add New Shipping Address
                        </h3>

                        <form onSubmit={handleCreateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" required value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input type="tel" className="form-input" required value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Street Address & Landmark</label>
                                <input type="text" className="form-input" required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apartment / Unit (Optional)</label>
                                <input type="text" className="form-input" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">City / Area</label>
                                    <input type="text" className="form-input" required value={city} onChange={e => setCity(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Emirate</label>
                                    <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                                        <option value="Dubai">Dubai</option>
                                        <option value="Abu Dhabi">Abu Dhabi</option>
                                        <option value="Sharjah">Sharjah</option>
                                        <option value="Ajman">Ajman</option>
                                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                                        <option value="Fujairah">Fujairah</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">PO Box / Postal Code</label>
                                <input type="text" className="form-input" required value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 00000" />
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                                <span>Make this my default shipping address</span>
                            </label>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
