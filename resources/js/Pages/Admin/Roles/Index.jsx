import React, { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Shield, Users, Plus, Edit, Trash2, X, CheckSquare, Square } from 'lucide-react';

export default function AdminRolesIndex({
    roles = [],
    staffUsers = {},
    permissionGroups = {},
    allSidebarPermissions = [],
    activeTab: initialTab = 'roles',
    filters = {},
}) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors, auth } = usePage().props;

    const [tab, setTab] = useState(initialTab === 'staff' ? 'staff' : 'roles');
    useEffect(() => {
        setTab(initialTab === 'staff' ? 'staff' : 'roles');
    }, [initialTab]);

    // Permission label lookup map
    const permissionLabelMap = useMemo(() => {
        const map = {};
        allSidebarPermissions.forEach((p) => {
            map[p.name] = p.label;
        });
        return map;
    }, [allSidebarPermissions]);

    const allPermissionNames = useMemo(
        () => allSidebarPermissions.map((p) => p.name),
        [allSidebarPermissions]
    );

    // Role Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [savingRole, setSavingRole] = useState(false);

    // Staff Modal State
    const [search, setSearch] = useState(safeFilters.search || '');
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffName, setStaffName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffPhone, setStaffPhone] = useState('');
    const [staffRole, setStaffRole] = useState('editor');
    const [staffStatus, setStaffStatus] = useState('active');
    const [staffPassword, setStaffPassword] = useState('');
    const [savingStaff, setSavingStaff] = useState(false);

    const openCreateRole = () => {
        setEditingRole(null);
        setRoleName('');
        setSelectedPermissions(['view dashboard']);
        setShowRoleModal(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        setRoleName(role.name);
        setSelectedPermissions([...(role.permissions || [])]);
        setShowRoleModal(true);
    };

    const togglePermission = (permName) => {
        if (editingRole?.is_admin) return;
        setSelectedPermissions((prev) =>
            prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
        );
    };

    const toggleGroupPermissions = (groupItems) => {
        if (editingRole?.is_admin) return;
        const groupNames = groupItems.map((item) => item.name);
        const allSelected = groupNames.every((name) => selectedPermissions.includes(name));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((p) => !groupNames.includes(p)));
        } else {
            setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupNames])));
        }
    };

    const handleSaveRole = (e) => {
        e.preventDefault();
        setSavingRole(true);

        const payload = {
            name: roleName,
            permissions: selectedPermissions,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowRoleModal(false);
                setEditingRole(null);
            },
            onFinish: () => setSavingRole(false),
        };

        if (editingRole) {
            router.put(`/admin/roles/${editingRole.id}`, payload, options);
        } else {
            router.post('/admin/roles', payload, options);
        }
    };

    const handleDeleteRole = (role) => {
        if (confirm(`Delete role "${role.label}"?`)) {
            router.delete(`/admin/roles/${role.id}`, { preserveScroll: true });
        }
    };

    // Staff handlers
    const handleStaffSearch = () => {
        router.get('/admin/roles', { tab: 'staff', search }, { preserveState: true, replace: true });
    };

    const openCreateStaff = () => {
        setEditingStaff(null);
        setStaffName('');
        setStaffEmail('');
        setStaffPhone('');
        const defaultRole = roles.find((r) => r.name !== 'admin')?.name || roles[0]?.name || 'editor';
        setStaffRole(defaultRole);
        setStaffStatus('active');
        setStaffPassword('');
        setShowStaffModal(true);
    };

    const openEditStaff = (member) => {
        setEditingStaff(member);
        setStaffName(member.name || '');
        setStaffEmail(member.email || '');
        setStaffPhone(member.phone || '');
        setStaffRole(member.role || 'editor');
        setStaffStatus(member.status || 'active');
        setStaffPassword('');
        setShowStaffModal(true);
    };

    const handleSaveStaff = (e) => {
        e.preventDefault();
        setSavingStaff(true);

        const payload = {
            name: staffName,
            email: staffEmail,
            phone: staffPhone || null,
            role: staffRole,
            status: staffStatus,
            password: staffPassword || null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowStaffModal(false);
                setEditingStaff(null);
            },
            onFinish: () => setSavingStaff(false),
        };

        if (editingStaff) {
            router.put(`/admin/roles/staff/${editingStaff.id}`, payload, options);
        } else {
            router.post('/admin/roles/staff', payload, options);
        }
    };

    const handleDeleteStaff = (member) => {
        if (confirm(`Remove staff member "${member.name}"?`)) {
            router.delete(`/admin/roles/staff/${member.id}`, { preserveScroll: true });
        }
    };

    const staffItems = Array.isArray(staffUsers) ? staffUsers : (staffUsers?.data || []);
    const staffTotal = staffUsers?.total ?? staffItems.length;
    const errorMessages = Object.values(errors || {}).filter(Boolean);

    const roleColumns = [
        {
            key: 'role',
            label: 'Role',
            width: '200px',
            render: (role) => (
                <div>
                    <strong>{role.label}</strong>
                    <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                        {role.name}
                        {role.is_system && ' • system'}
                    </div>
                </div>
            ),
        },
        {
            key: 'users_count',
            label: 'Staff Assigned',
            width: '140px',
            render: (role) => (
                <span className="badge badge-neutral">
                    {role.users_count || 0} {role.users_count === 1 ? 'member' : 'members'}
                </span>
            ),
        },
        {
            key: 'permissions',
            label: 'Sidebar Permissions',
            render: (role) => {
                if (role.is_admin) {
                    return (
                        <span className="badge badge-success">
                            All {allPermissionNames.length} Sidebar Modules (Full Access)
                        </span>
                    );
                }

                const perms = role.permissions || [];
                if (perms.length === 0) {
                    return <span style={{ color: '#94A3B8', fontSize: '12px' }}>No sidebar permissions assigned</span>;
                }

                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {perms.map((perm) => (
                            <span key={perm} className="badge badge-neutral">
                                {permissionLabelMap[perm] || perm}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            width: '130px',
            render: (role) => (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title={role.is_admin ? 'View Permissions' : 'Edit Role & Permissions'}
                        onClick={() => openEditRole(role)}
                    >
                        <Edit size={14} />
                    </button>
                    {!role.is_system && (
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#D93025', borderColor: '#FECDD3' }}
                            title="Delete Role"
                            onClick={() => handleDeleteRole(role)}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const staffColumns = [
        {
            key: 'name',
            label: 'Staff Member',
            render: (m) => <strong>{m.name}</strong>,
        },
        {
            key: 'contact',
            label: 'Email & Phone',
            render: (m) => (
                <>
                    <div>{m.email}</div>
                    <small style={{ color: '#64748B' }}>{m.phone || '—'}</small>
                </>
            ),
        },
        {
            key: 'role',
            label: 'Assigned Role',
            render: (m) => (
                <span
                    className={`badge ${m.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}
                    style={{ textTransform: 'capitalize' }}
                >
                    {m.role ? m.role.replace(/_/g, ' ') : 'Unassigned'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (m) => (
                <span
                    className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                    style={{ textTransform: 'capitalize' }}
                >
                    {m.status || 'active'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (m) => {
                const isProtected = m.email === 'admin@autosparts.com' || m.id === auth?.user?.id;
                return (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Edit Staff Member"
                            onClick={() => openEditStaff(m)}
                        >
                            <Edit size={14} />
                        </button>
                        {!isProtected && (
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ color: '#D93025', borderColor: '#FECDD3' }}
                                title="Remove Staff Member"
                                onClick={() => handleDeleteStaff(m)}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Roles & Sidebar Permissions">
            {errorMessages.length > 0 && !showRoleModal && !showStaffModal && (
                <div
                    style={{
                        backgroundColor: '#FFF1F2',
                        color: '#D93025',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '13px',
                    }}
                >
                    {errorMessages.map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}

            {/* Tabs Bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button
                    type="button"
                    className={`btn btn-sm ${tab === 'roles' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTab('roles')}
                >
                    <Shield size={15} />
                    <span>Roles &amp; Permissions ({roles.length})</span>
                </button>

                <button
                    type="button"
                    className={`btn btn-sm ${tab === 'staff' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTab('staff')}
                >
                    <Users size={15} />
                    <span>Staff Members ({staffTotal})</span>
                </button>
            </div>

            {tab === 'roles' ? (
                <AdminDataTable
                    title="Administrative Roles & Sidebar Access"
                    count={roles.length}
                    actions={
                        <button type="button" className="btn btn-primary btn-sm" onClick={openCreateRole}>
                            <Plus size={16} /> Add Role
                        </button>
                    }
                    columns={roleColumns}
                    rows={roles}
                    emptyMessage="No administrative roles found."
                />
            ) : (
                <AdminDataTable
                    title="Administrative Staff Members"
                    count={staffTotal}
                    search={{
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Search staff by name, email, or phone...',
                    }}
                    onSearch={handleStaffSearch}
                    actions={
                        <button type="button" className="btn btn-primary btn-sm" onClick={openCreateStaff}>
                            <Plus size={16} /> Add Staff Member
                        </button>
                    }
                    columns={staffColumns}
                    rows={staffItems}
                    emptyMessage="No staff members found."
                    pagination={Array.isArray(staffUsers) ? null : staffUsers}
                    itemLabel="staff members"
                />
            )}

            {/* Create / Edit Role & Sidebar Permissions Modal */}
            {showRoleModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowRoleModal(false)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '28px',
                            width: '94%',
                            maxWidth: '720px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                                {editingRole
                                    ? editingRole.is_admin
                                        ? 'Administrator Permissions (Full Access)'
                                        : `Edit Role: ${editingRole.label}`
                                    : 'Create New Role'}
                            </h3>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowRoleModal(false)}
                                aria-label="Close modal"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {errorMessages.length > 0 && (
                            <div
                                style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#B91C1C',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                }}
                            >
                                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                    {errorMessages.map((msg, i) => (
                                        <li key={i}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Role Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    disabled={Boolean(editingRole?.is_system)}
                                    placeholder="e.g. Warehouse Manager, Order Support, Marketing Lead"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                />
                                {editingRole?.is_system && (
                                    <small style={{ color: '#64748B', fontSize: '12px' }}>
                                        System role name is locked; sidebar permissions below can be customized.
                                    </small>
                                )}
                            </div>

                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <label className="form-label" style={{ margin: 0 }}>
                                        Sidebar Element Permissions ({selectedPermissions.length} / {allPermissionNames.length}{' '}
                                        selected)
                                    </label>

                                    {!editingRole?.is_admin && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setSelectedPermissions([...allPermissionNames])}
                                            >
                                                <CheckSquare size={13} /> Select All
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setSelectedPermissions([])}
                                            >
                                                <Square size={13} /> Clear All
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {Object.entries(permissionGroups).map(([groupTitle, groupItems]) => {
                                        const allInGroup = groupItems.every((i) =>
                                            selectedPermissions.includes(i.name)
                                        );

                                        return (
                                            <div
                                                key={groupTitle}
                                                style={{
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: '10px 14px',
                                                        backgroundColor: '#F8FAFC',
                                                        borderBottom: '1px solid #E2E8F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <strong
                                                        style={{
                                                            fontSize: '12px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            color: '#334155',
                                                        }}
                                                    >
                                                        {groupTitle}
                                                    </strong>

                                                    {!editingRole?.is_admin && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleGroupPermissions(groupItems)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                color: '#F36B16',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {allInGroup ? 'Deselect Section' : 'Select Section'}
                                                        </button>
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        padding: '12px 14px',
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                                        gap: '10px',
                                                    }}
                                                >
                                                    {groupItems.map((perm) => {
                                                        const checked =
                                                            editingRole?.is_admin ||
                                                            selectedPermissions.includes(perm.name);
                                                        return (
                                                            <label
                                                                key={perm.name}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    gap: '10px',
                                                                    padding: '8px 10px',
                                                                    borderRadius: '6px',
                                                                    border: checked
                                                                        ? '1px solid #FDBA74'
                                                                        : '1px solid #E2E8F0',
                                                                    backgroundColor: checked ? '#FFF7ED' : '#FFF',
                                                                    cursor: editingRole?.is_admin ? 'default' : 'pointer',
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    disabled={Boolean(editingRole?.is_admin)}
                                                                    onChange={() => togglePermission(perm.name)}
                                                                    style={{ marginTop: '3px' }}
                                                                />
                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            fontSize: '13px',
                                                                            fontWeight: 700,
                                                                            color: '#0F172A',
                                                                        }}
                                                                    >
                                                                        {perm.label}
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            color: '#64748B',
                                                                            lineHeight: 1.35,
                                                                        }}
                                                                    >
                                                                        {perm.description}
                                                                    </div>
                                                                    <code
                                                                        style={{
                                                                            fontSize: '10px',
                                                                            color: '#94A3B8',
                                                                        }}
                                                                    >
                                                                        {perm.name}
                                                                    </code>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    {editingRole?.is_admin ? 'Close' : 'Cancel'}
                                </button>
                                {!editingRole?.is_admin && (
                                    <button type="submit" className="btn btn-primary" disabled={savingRole}>
                                        {savingRole ? 'Saving...' : editingRole ? 'Save Permissions' : 'Create Role'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Create / Edit Staff Member Modal */}
            {showStaffModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowStaffModal(false)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '28px',
                            width: '92%',
                            maxWidth: '520px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
                            </h3>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowStaffModal(false)}
                                aria-label="Close modal"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {errorMessages.length > 0 && (
                            <div
                                style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#B91C1C',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                }}
                            >
                                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                    {errorMessages.map((msg, i) => (
                                        <li key={i}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Full Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={staffName}
                                    onChange={(e) => setStaffName(e.target.value)}
                                    placeholder="e.g. Priya Verma"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Email Address <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        value={staffEmail}
                                        onChange={(e) => setStaffEmail(e.target.value)}
                                        placeholder="staff@autosparts.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={staffPhone}
                                        onChange={(e) => setStaffPhone(e.target.value)}
                                        placeholder="+91 98765 00010"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Assigned Role <span className="required">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        value={staffRole}
                                        disabled={editingStaff?.email === 'admin@autosparts.com'}
                                        onChange={(e) => setStaffRole(e.target.value)}
                                    >
                                        {roles.map((r) => (
                                            <option key={r.name} value={r.name}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Account Status</label>
                                    <select
                                        className="form-select"
                                        value={staffStatus}
                                        disabled={editingStaff?.email === 'admin@autosparts.com'}
                                        onChange={(e) => setStaffStatus(e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    {editingStaff ? 'New Password (leave blank to keep current)' : 'Login Password'}{' '}
                                    {!editingStaff && <span className="required">*</span>}
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    required={!editingStaff}
                                    minLength={6}
                                    value={staffPassword}
                                    onChange={(e) => setStaffPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowStaffModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={savingStaff}>
                                    {savingStaff
                                        ? 'Saving...'
                                        : editingStaff
                                            ? 'Update Staff Member'
                                            : 'Create Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
