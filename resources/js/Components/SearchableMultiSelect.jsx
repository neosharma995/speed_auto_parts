import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

export default function SearchableMultiSelect({
    options = [],
    selectedIds = [],
    onChange,
    placeholder = 'Search & select products...',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedKeySet = useMemo(
        () => new Set(selectedIds.map((id) => String(id))),
        [selectedIds]
    );

    const selectedOptions = useMemo(
        () => options.filter((opt) => selectedKeySet.has(String(opt.id))),
        [options, selectedKeySet]
    );

    const filteredOptions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((opt) => {
            const haystack = [
                opt.label,
                opt.sublabel,
                opt.badge,
                opt.meta,
                opt.searchText,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [options, query]);

    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const toggleOption = (id) => {
        const key = String(id);
        if (selectedKeySet.has(key)) {
            onChange(selectedIds.filter((item) => String(item) !== key));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const handleSelectAllFiltered = () => {
        const existingKeys = new Set(selectedIds.map((id) => String(id)));
        const nextIds = [...selectedIds];
        filteredOptions.forEach((opt) => {
            if (!existingKeys.has(String(opt.id))) {
                existingKeys.add(String(opt.id));
                nextIds.push(opt.id);
            }
        });
        onChange(nextIds);
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const handleRemoveChip = (id) => {
        const key = String(id);
        onChange(selectedIds.filter((item) => String(item) !== key));
    };

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: '#FFFFFF',
                    border: isOpen ? '1px solid #EA580C' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: selectedOptions.length > 0 ? '#0F172A' : '#64748B',
                    boxShadow: isOpen ? '0 0 0 3px rgba(234, 88, 12, 0.12)' : 'none',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <Search size={15} style={{ color: '#64748B', flexShrink: 0 }} />
                    <span style={{ fontWeight: selectedOptions.length > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedOptions.length > 0
                            ? `${selectedOptions.length} ${selectedOptions.length === 1 ? 'item' : 'items'} selected`
                            : placeholder}
                    </span>
                </span>
                <ChevronDown
                    size={16}
                    style={{
                        color: '#64748B',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                    }}
                />
            </button>

            {/* In-flow Dropdown Panel so modal scroll containers never clip options */}
            {isOpen && (
                <div
                    style={{
                        marginTop: '6px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Search + Quick Actions */}
                    <div
                        style={{
                            padding: '10px',
                            backgroundColor: '#F8FAFC',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <div style={{ position: 'relative', flex: '1 1 220px', display: 'flex', alignItems: 'center' }}>
                            <Search
                                size={14}
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    color: '#64748B',
                                    pointerEvents: 'none',
                                }}
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="form-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Type product name or SKU..."
                                style={{
                                    width: '100%',
                                    paddingLeft: '30px',
                                    paddingRight: query ? '28px' : '10px',
                                    fontSize: '13px',
                                }}
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    title="Clear search"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '2px',
                                        cursor: 'pointer',
                                        color: '#64748B',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={filteredOptions.length === 0}
                                onClick={handleSelectAllFiltered}
                            >
                                Select All ({filteredOptions.length})
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={selectedIds.length === 0}
                                onClick={handleClearAll}
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>

                    {/* Checkable Options List */}
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {filteredOptions.length === 0 ? (
                            <div
                                style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    fontSize: '13px',
                                    color: '#64748B',
                                }}
                            >
                                {options.length === 0
                                    ? 'No products with available stock.'
                                    : `No matching products for "${query}".`}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isChecked = selectedKeySet.has(String(opt.id));
                                return (
                                    <div
                                        key={opt.id}
                                        role="option"
                                        aria-selected={isChecked}
                                        onClick={() => toggleOption(opt.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            padding: '10px 12px',
                                            borderBottom: '1px solid #F1F5F9',
                                            cursor: 'pointer',
                                            backgroundColor: isChecked ? '#FFF7ED' : '#FFFFFF',
                                            transition: 'background-color 0.12s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                            <span
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '4px',
                                                    border: isChecked ? '1px solid #EA580C' : '1px solid #CBD5E1',
                                                    backgroundColor: isChecked ? '#EA580C' : '#FFFFFF',
                                                    color: '#FFFFFF',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isChecked && <Check size={12} strokeWidth={3} />}
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        color: '#0F172A',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {opt.label}
                                                </div>
                                                {opt.sublabel && (
                                                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                                                        {opt.sublabel}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            {opt.badge && (
                                                <span className="badge badge-info" style={{ fontSize: '11px' }}>
                                                    {opt.badge}
                                                </span>
                                            )}
                                            {opt.meta && (
                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                                                    {opt.meta}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Selected Item Chips */}
            {selectedOptions.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                    }}
                >
                    {selectedOptions.map((opt) => (
                        <span
                            key={opt.id}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#0F172A',
                            }}
                        >
                            <span>{opt.label}</span>
                            {opt.sublabel && (
                                <span style={{ color: '#64748B', fontSize: '11px' }}>
                                    ({opt.sublabel})
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemoveChip(opt.id)}
                                title={`Remove ${opt.label}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                }}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
