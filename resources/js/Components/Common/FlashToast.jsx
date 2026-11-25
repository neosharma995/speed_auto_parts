import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function FlashToast({ duration = 4000 }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success, id: Date.now() });
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error, id: Date.now() });
        }
    }, [flash]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => {
            setToast(null);
        }, duration);
        return () => clearTimeout(timer);
    }, [toast, duration]);

    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                maxWidth: '420px',
                minWidth: '280px',
                backgroundColor: isSuccess ? '#ECFDF5' : '#FFF1F2',
                color: isSuccess ? '#065F46' : '#9F1239',
                border: `1px solid ${isSuccess ? '#6EE7B7' : '#FDA4AF'}`,
                borderLeft: `4px solid ${isSuccess ? '#059669' : '#E11D48'}`,
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.16)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1.4 }}>
                {isSuccess ? (
                    <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
                ) : (
                    <AlertCircle size={18} color="#E11D48" style={{ flexShrink: 0 }} />
                )}
                <span>{toast.message}</span>
            </div>
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setToast(null)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.75,
                    flexShrink: 0,
                }}
            >
                <X size={15} />
            </button>
        </div>
    );
}
