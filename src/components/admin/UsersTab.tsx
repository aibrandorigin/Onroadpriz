import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  UserPlus,
  Eye, 
  EyeOff,
  Edit2, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Car, 
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  RefreshCw,
  Lock
} from 'lucide-react';

export const UsersTab: React.FC = () => {
  const { 
    users, 
    vehicles, 
    payments, 
    sellerPlans,
    buyerPlans,
    createAdminUser,
    updateUser, 
    deleteUser, 
    addAuditLog, 
    showToast,
    refreshAdminUsers
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshAdminUsers();
  }, [refreshAdminUsers]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAdminUsers();
    setIsRefreshing(false);
    showToast('Users Synchronized', 'Authoritative user records loaded from database.', 'success');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [verifiedFilter, setVerifiedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected user for modal profile inspection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [editUserPassword, setEditUserPassword] = useState('');
  const [showEditUserPassword, setShowEditUserPassword] = useState(false);
  const [editError, setEditError] = useState('');

  // Add New Admin Modal State
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<UserRole>('Admin');
  const [newAdminCity, setNewAdminCity] = useState('');
  const [newAdminState, setNewAdminState] = useState('');
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [addAdminError, setAddAdminError] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const adminUsersList = useMemo(() => {
    return users.filter(
      u => u.role === 'Admin' || u.role === 'Super Admin' || u.role === 'Moderator' || u.role === 'admin'
    );
  }, [users]);

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError('');

    if (!newAdminName.trim()) {
      setAddAdminError('Please enter the administrator full name.');
      return;
    }

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAddAdminError('Please enter a valid email address for administrator login.');
      return;
    }

    const cleanPhoneDigits = newAdminPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhoneDigits.length !== 10) {
      setAddAdminError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!newAdminPassword.trim() || newAdminPassword.trim().length < 6) {
      setAddAdminError('Password must be at least 6 characters long.');
      return;
    }

    setIsCreatingAdmin(true);
    const res = await createAdminUser({
      name: newAdminName.trim(),
      email: cleanEmail,
      phone: `+91${cleanPhoneDigits}`,
      password: newAdminPassword.trim(),
      role: newAdminRole,
      city: newAdminCity.trim(),
      state: newAdminState.trim()
    });
    setIsCreatingAdmin(false);

    if (res.success && res.user) {
      addAuditLog({
        action: 'New Admin Created',
        module: 'User Management',
        recordId: res.user.id,
        oldValue: 'None',
        newValue: `${res.user.name} (${res.user.email}) — Role: ${res.user.role}`
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPassword('');
      setNewAdminRole('Admin');
      setNewAdminCity('');
      setNewAdminState('');
      setIsAddAdminModalOpen(false);
    } else {
      setAddAdminError(res.error || 'Could not create administrator account.');
    }
  };

  const getPlanDisplayName = (u: User) => {
    if (u.activePlan && u.activePlan !== 'No Active Plan') return u.activePlan;
    if (u.buyerPlan?.name) return u.buyerPlan.name;
    if (u.sellerPlan?.name) return u.sellerPlan.name;
    const planId = u.subscriptionPlanId || '';
    const matching = [...sellerPlans, ...buyerPlans].find(p => p.id === planId);
    if (matching) return matching.name;
    if (planId === 'plan-sel-pro') return 'Premium Seller Pro';
    if (planId === 'plan-sel-basic') return 'Standard Owner Plan';
    if (planId === 'plan-buy-premium') return 'VIP Buyer Pass';
    if (planId === 'plan-sel-enterprise') return 'Fleet & Commercial Dealer';
    if (planId === 'plan-buy-elite') return 'Commercial & Fleet Buyer Elite';
    return u.role === 'Seller' ? 'Standard Owner Plan' : 'Standard Buyer';
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.phone && user.phone.includes(q)) ||
        (user.location && user.location.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'All' || 
        (roleFilter === 'Buyer' && user.role === 'Buyer') ||
        (roleFilter === 'Seller' && user.role === 'Seller') ||
        (roleFilter === 'Staff' && (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Moderator'));

      const matchesVerified = verifiedFilter === 'All' ||
        (verifiedFilter === 'Verified' && user.verified) ||
        (verifiedFilter === 'Unverified' && !user.verified);

      const matchesStatus = statusFilter === 'All' ||
        (user.status?.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesRole && matchesVerified && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, verifiedFilter, statusFilter]);

  const handleToggleVerify = (u: User) => {
    const newStatus = !u.verified;
    updateUser(u.id, { verified: newStatus });
    addAuditLog({
      action: newStatus ? 'User Verified' : 'User Verification Revoked',
      module: 'User Management',
      recordId: u.id,
      oldValue: `Verified: ${u.verified}`,
      newValue: `Verified: ${newStatus}`
    });
    showToast('Verification Updated', `${u.name} is now ${newStatus ? 'Verified' : 'Unverified'}.`, 'success');
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    updateUser(u.id, { status: nextStatus });
    addAuditLog({
      action: `User Account ${nextStatus}`,
      module: 'User Management',
      recordId: u.id,
      oldValue: `Status: ${u.status}`,
      newValue: `Status: ${nextStatus}`
    });
    showToast('Status Updated', `${u.name} account is now ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Are you sure you want to remove user "${u.name}"?`)) {
      deleteUser(u.id);
      addAuditLog({
        action: 'User Deleted',
        module: 'User Management',
        recordId: u.id,
        oldValue: `User: ${u.name} (${u.email})`,
        newValue: 'Deleted'
      });
      if (selectedUser?.id === u.id) setSelectedUser(null);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Location', 'Registered At'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      u.role || 'Buyer',
      u.status || 'Active',
      u.verified ? 'Yes' : 'No',
      `"${u.location || ''}"`,
      u.registeredAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `onroadpriz_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Generated', `Exported ${filteredUsers.length} user records to CSV.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header bar matching reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              User Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#77101F]/10 text-[#77101F]">
              {filteredUsers.length} Total Users
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, verify KYC profiles, manage seller permissions, and monitor user transaction cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setAddAdminError('');
              setIsAddAdminModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add New Admin</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            title="Fetch fresh data from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#77101F] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Users'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Administrators & Staff Quick Bar */}
      <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#77101F] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Platform Administrators &amp; Staff ({adminUsersList.length})
              </h3>
              <button
                type="button"
                onClick={() => setRoleFilter(roleFilter === 'Staff' ? 'All' : 'Staff')}
                className="text-[11px] font-bold text-[#77101F] hover:underline cursor-pointer"
              >
                {roleFilter === 'Staff' ? 'Show All Users' : 'Filter Admins Only →'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Active Admins: {adminUsersList.map(a => `${a.name} (${a.role})`).join(' • ') || 'None'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddAdminError('');
            setIsAddAdminModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 text-[#77101F] border border-amber-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Admin Account</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#77101F] focus:bg-white"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
        >
          <option value="All">All User Personas</option>
          <option value="Buyer">Buyers Only</option>
          <option value="Seller">Sellers Only</option>
          <option value="Staff">Platform Staff / Admins</option>
        </select>

        {/* Verification Filter */}
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
        >
          <option value="All">All Verification</option>
          <option value="Verified">Verified Only</option>
          <option value="Unverified">Unverified Only</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Users Data Table: MOBILE CARDS + DESKTOP TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* MOBILE CARD VIEW */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-slate-400">
              No users matching criteria.
            </div>
          ) : (
            filteredUsers.map(user => {
              const userVehicles = vehicles.filter(v => v.seller.id === user.id);
              const isStaff = user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Moderator';

              return (
                <div key={user.id} className="p-3.5 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Top row: Avatar + Name + Badges */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isStaff 
                            ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                            : user.role === 'Seller'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1 truncate">
                        {user.name}
                      </h4>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user.email || 'Email: Not provided'}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Meta Row */}
                  <div className="text-xs py-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <span className="font-mono">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{user.location || 'Visakhapatnam, AP'}</span>
                    </div>
                  </div>

                  {/* Listings & Plan badge */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-700">
                        {userVehicles.length} {userVehicles.length === 1 ? 'Listing' : 'Listings'}
                      </span>
                      <span className="text-slate-400 ml-1">
                        • {getPlanDisplayName(user)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleVerify(user)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        user.verified
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user.verified ? 'Verified' : 'Unverified'}</span>
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => setEditUserModal(user)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.status === 'Active'
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Persona</th>
                <th className="py-3 px-4">Listings / Plan</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const userVehicles = vehicles.filter(v => v.seller.id === user.id);
                  const isStaff = user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Moderator';
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {user.email ? user.email : <span className="italic text-slate-400">Email: Not provided</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{user.phone}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{user.location || 'Visakhapatnam, AP'}</span>
                        </div>
                      </td>

                      {/* Persona */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStaff 
                            ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                            : user.role === 'Seller'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Listings / Plan */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {userVehicles.length} {userVehicles.length === 1 ? 'Listing' : 'Listings'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {getPlanDisplayName(user)}
                        </div>
                      </td>

                      {/* Registered */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('en-GB') : '12 Jan 2026'}
                      </td>

                      {/* Verified */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleVerify(user)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            user.verified
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{user.verified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Inspect Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditUserModal(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'Active'
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                          >
                            {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detailed Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#77101F] text-white font-bold flex items-center justify-center text-sm">
                  {selectedUser.name ? selectedUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email || 'Email: Not provided'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Meta Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-800">{selectedUser.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Location</span>
                <span className="font-semibold text-slate-800">{selectedUser.location || selectedUser.city || 'Location not set'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Role</span>
                <span className="font-semibold text-slate-800">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">KYC Verification</span>
                <span className={`font-bold ${selectedUser.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedUser.verified ? '✓ Verified Direct Owner' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {/* Confirmed Location Details (Section 12) */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>Confirmed Location (Database Record)</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  selectedUser.location_source === 'DEVICE_GEOLOCATION'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  Source: {selectedUser.location_source || (selectedUser.city ? 'MANUAL' : 'NOT SET')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Formatted Address</span>
                  <span className="font-semibold text-slate-800 leading-tight block">
                    {selectedUser.formatted_address || selectedUser.location || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Area / Locality</span>
                  <span className="font-semibold text-slate-800">
                    {selectedUser.area || selectedUser.locality || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">City & State</span>
                  <span className="font-semibold text-slate-800">
                    {selectedUser.city ? `${selectedUser.city}${selectedUser.state ? ', ' + selectedUser.state : ''}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">PIN Code</span>
                  <span className="font-semibold text-slate-800">
                    {selectedUser.postal_code || selectedUser.address?.pincode || '—'}
                  </span>
                </div>
              </div>

              {/* Coordinates & Accuracy (Operationally necessary / access-controlled) */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                <div>
                  <span className="font-bold block text-slate-400 uppercase">Latitude</span>
                  <span className="font-mono text-slate-700">
                    {typeof selectedUser.latitude === 'number' ? selectedUser.latitude.toFixed(6) + '°' : '—'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-slate-400 uppercase">Longitude</span>
                  <span className="font-mono text-slate-700">
                    {typeof selectedUser.longitude === 'number' ? selectedUser.longitude.toFixed(6) + '°' : '—'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-slate-400 uppercase">Accuracy Radius</span>
                  <span className="font-bold text-slate-800">
                    {typeof selectedUser.location_accuracy_meters === 'number'
                      ? `±${Math.round(selectedUser.location_accuracy_meters)} m`
                      : '—'}
                  </span>
                </div>
              </div>

              {selectedUser.location_updated_at && (
                <div className="text-[10px] text-slate-400 pt-1">
                  Last Updated: {new Date(selectedUser.location_updated_at).toLocaleString()}
                </div>
              )}
            </div>

            {/* Active Plan */}
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-purple-700 font-bold uppercase block">Active Membership</span>
                <span className="font-bold text-slate-900 text-sm">
                  {getPlanDisplayName(selectedUser)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                Active Tier
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleToggleVerify(selectedUser)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                {selectedUser.verified ? 'Revoke Verification' : 'Approve Verification'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit User Profile</h3>
              <button onClick={() => { setEditUserModal(null); setEditError(''); }} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold animate-in fade-in">
                {editError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditError('');

                const cleanEmail = editUserModal.email ? editUserModal.email.trim().toLowerCase() : '';
                const cleanPhone = (editUserModal.phone || '').replace(/\D/g, '').slice(-10);

                if (cleanEmail) {
                  const dupEmail = users.find(u => u.id !== editUserModal.id && u.email && u.email.trim().toLowerCase() === cleanEmail);
                  if (dupEmail) {
                    setEditError(`Email "${cleanEmail}" is already registered to user "${dupEmail.name || dupEmail.fullName}".`);
                    return;
                  }
                }

                if (cleanPhone) {
                  const dupPhone = users.find(u => u.id !== editUserModal.id && (u.phone || u.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone);
                  if (dupPhone) {
                    setEditError(`Phone number is already registered to user "${dupPhone.name || dupPhone.fullName}".`);
                    return;
                  }
                }

                const updatePayload: Partial<User> = {
                  name: editUserModal.name,
                  fullName: editUserModal.name,
                  email: cleanEmail || undefined,
                  phone: editUserModal.phone,
                  role: editUserModal.role,
                  city: editUserModal.city,
                  state: editUserModal.state,
                  location: [editUserModal.city, editUserModal.state].filter(Boolean).join(', ') || editUserModal.location,
                  subscriptionPlanId: editUserModal.subscriptionPlanId,
                  activePlan: editUserModal.activePlan
                };
                if (editUserPassword.trim()) {
                  updatePayload.password = editUserPassword.trim();
                }

                updateUser(editUserModal.id, updatePayload);
                setEditUserPassword('');
                setEditUserModal(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUserModal.name}
                  onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editUserModal.email || ''}
                    onChange={(e) => setEditUserModal({ ...editUserModal, email: e.target.value })}
                    placeholder="Not provided"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editUserModal.phone}
                    onChange={(e) => setEditUserModal({ ...editUserModal, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editUserModal.city || ''}
                    onChange={(e) => setEditUserModal({ ...editUserModal, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editUserModal.state || ''}
                    onChange={(e) => setEditUserModal({ ...editUserModal, state: e.target.value })}
                    placeholder="e.g. Telangana"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User Role</label>
                  <select
                    value={editUserModal.role}
                    onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Set / Reset Password</label>
                  <div className="relative">
                    <input
                      type={showEditUserPassword ? 'text' : 'password'}
                      value={editUserPassword}
                      onChange={(e) => setEditUserPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full p-2.5 pr-8 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditUserPassword(!showEditUserPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showEditUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Membership Plan</label>
                <select
                  value={editUserModal.subscriptionPlanId || (editUserModal.role === 'Seller' ? 'plan-sel-basic' : 'plan-buy-premium')}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const matchedPlan = [...sellerPlans, ...buyerPlans].find(p => p.id === selId);
                    setEditUserModal({
                      ...editUserModal,
                      subscriptionPlanId: selId,
                      activePlan: matchedPlan ? matchedPlan.name : editUserModal.activePlan
                    });
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden"
                >
                  <optgroup label="Seller Plans">
                    {sellerPlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Buyer Plans">
                    {buyerPlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditUserPassword('');
                    setEditUserModal(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#77101F] text-white font-bold rounded-xl hover:bg-[#5E0B17] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW ADMIN MODAL */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#77101F]/10 text-[#77101F] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg font-display">
                    Add New Administrator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Provision a new staff account with Admin Console privileges.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAdminModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addAdminError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {addAdminError}
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Vikram Aditya"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Role *</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-[#77101F] focus:outline-hidden focus:border-[#77101F] bg-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address (Login ID) *</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin.name@onroadpriz.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={newAdminPhone}
                      onChange={(e) => setNewAdminPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-10 pr-2.5 py-2.5 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:border-[#77101F]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Login Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewAdminPassword ? 'text' : 'password'}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City (Optional)</label>
                  <input
                    type="text"
                    value={newAdminCity}
                    onChange={(e) => setNewAdminCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State (Optional)</label>
                  <input
                    type="text"
                    value={newAdminState}
                    onChange={(e) => setNewAdminState(e.target.value)}
                    placeholder="e.g. Telangana"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isCreatingAdmin ? 'Creating Admin...' : 'Create Admin Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
