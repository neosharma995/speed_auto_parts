import React from 'react';
import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';

export default function AdminDataTable({
    title,
    count,
    showCount = true,
    search = null,
    filters = [],
    onSearch = null,
    searchButtonLabel = 'Search',
    hasActiveFilters = false,
    onReset = null,
    actions = null,
    columns = [],
    rows = [],
    rowKey = (row) => row.id,
    emptyMessage = 'No records found.',
    pagination = null,
    itemLabel = 'entries',
}) {
    const resolvedCount = count !== undefined ? count : (pagination?.total ?? rows.length);
    const hasSearchToolbar = Boolean(search || (filters && filters.length > 0) || onSearch);
    const hasLinks = Boolean(pagination?.links && pagination.links.length > 3);
    const showFooter = Boolean(pagination && (hasLinks || pagination.total !== undefined));

    const resolveRowKey = (row, idx) => {
        if (typeof rowKey === 'function') {
            return rowKey(row, idx);
        }
        return row?.[rowKey] ?? idx;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(e);
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header admin-data-table-header">
                <h3>
                    {title}
                    {showCount ? ` (${resolvedCount})` : ''}
                </h3>

                {(hasSearchToolbar || actions) && (
                    <div className="admin-table-toolbar">
                        {hasSearchToolbar && (
                            <form onSubmit={handleFormSubmit} className="admin-table-filter-form">
                                {search && (
                                    <div
                                        className="admin-table-search-field"
                                        style={{ minWidth: search.minWidth || '220px' }}
                                    >
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={search.placeholder || 'Search...'}
                                            value={search.value ?? ''}
                                            onChange={(e) => search.onChange && search.onChange(e.target.value)}
                                        />
                                    </div>
                                )}

                                {filters.map((filter) => (
                                    <select
                                        key={filter.key}
                                        className="form-select"
                                        style={{ width: 'auto' }}
                                        value={filter.value ?? ''}
                                        onChange={(e) => filter.onChange && filter.onChange(e.target.value)}
                                    >
                                        {filter.placeholder !== undefined && (
                                            <option value="">{filter.placeholder}</option>
                                        )}
                                        {(filter.options || []).map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ))}

                                {onSearch && (
                                    <button type="submit" className="btn btn-dark btn-sm">
                                        <Search size={14} /> {searchButtonLabel}
                                    </button>
                                )}

                                {hasActiveFilters && onReset && (
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={onReset}
                                        title="Reset Filters"
                                    >
                                        <RotateCcw size={14} /> Reset
                                    </button>
                                )}
                            </form>
                        )}

                        {actions && <div className="admin-table-actions">{actions}</div>}
                    </div>
                )}
            </div>

            <div className="admin-card-body" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{
                                        ...(col.align ? { textAlign: col.align } : {}),
                                        ...(col.width ? { width: col.width } : {}),
                                        ...(col.headerStyle || {}),
                                    }}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length || 1}
                                    style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rowIdx) => (
                                <tr key={resolveRowKey(row, rowIdx)}>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            style={{
                                                ...(col.align ? { textAlign: col.align } : {}),
                                                ...(col.width ? { width: col.width } : {}),
                                                ...(col.cellStyle || {}),
                                            }}
                                        >
                                            {col.render ? col.render(row, rowIdx) : row?.[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showFooter && (
                <div className="admin-data-table-footer">
                    <div className="admin-data-table-summary">
                        Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total ?? rows.length}{' '}
                        {itemLabel}
                    </div>

                    {hasLinks && (
                        <div className="pagination">
                            {pagination.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`pagination-item ${link.active ? 'pagination-item--active' : ''}`}
                                    onClick={() =>
                                        link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })
                                    }
                                    disabled={!link.url}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
