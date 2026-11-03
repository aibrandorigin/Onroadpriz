import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Car, 
  Heart, 
  Receipt, 
  LogOut, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Eye,
  EyeOff,
  Trash2,
  X
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { 
    currentUser, 
    vehicles, 
    wishlist, 
    toggleWishlist,
    activeBuyerPlan, 
    activeSellerPlan, 
    planHistory, 
    planPayments, 
    updateUserProfile, 
    updateUserLocation, 
    refreshUserData,
    requestMobileChangeOtp,
    changeUserMobile,
    logout, 
    navigate, 
    setAuthModalOpen,
    showToast,
    isAdmin,
    setLocationModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'plans' | 'history' | 'activity' | 'security'>('profile');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mobile Change Modal State
  const [isChangeMobileModalOpen, setIsChangeMobileModalOpen] = useState(false);
  const [mobileChangeStep, setMobileChangeStep] = useState<'input' | 'otp'>('input');
  const [newMobileInput, setNewMobileInput] = useState('');
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [isSubmittingMobile, setIsSubmittingMobile] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Edit Profile Form State (All Fields + Password)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'Buyer' | 'Seller'>('Buyer');
  const [editArea, setEditArea] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const openEditProfileModal = () => {
    if (currentUser) {
      setEditName(currentUser.name || currentUser.fullName || '');
      setEditPhone((currentUser.phone || currentUser.mobile || '').replace(/\D/g, '').slice(-10));
      setEditEmail(currentUser.email || '');
      setEditRole(currentUser.role === 'Seller' ? 'Seller' : 'Buyer');
      setEditArea(currentUser.area === 'All Places' ? '' : (currentUser.area || (currentUser.locality === 'All Places' ? '' : currentUser.locality) || ''));
      setEditCity(currentUser.city || '');
      setEditState(currentUser.state || '');
      setEditPincode(currentUser.postal_code || currentUser.pincode || currentUser.address?.pincode || '');
      setEditAddress(currentUser.formatted_address || currentUser.street || '');
      setEditNewPassword('');
      setEditConfirmPassword('');
    }
    setIsEditProfileModalOpen(true);
  };

  useEffect(() => {
    if (currentUser && !isEditProfileModalOpen) {
      setEditName(currentUser.name || currentUser.fullName || '');
      setEditPhone((currentUser.phone || currentUser.mobile || '').replace(/\D/g, '').slice(-10));
      setEditEmail(currentUser.email || '');
      setEditRole(currentUser.role === 'Seller' ? 'Seller' : 'Buyer');
      setEditArea(currentUser.area === 'All Places' ? '' : (currentUser.area || (currentUser.locality === 'All Places' ? '' : currentUser.locality) || ''));
      setEditCity(currentUser.city || '');
      setEditState(currentUser.state || '');
      setEditPincode(currentUser.postal_code || currentUser.pincode || currentUser.address?.pincode || '');
      setEditAddress(currentUser.formatted_address || currentUser.street || '');
    }
  }, [currentUser, isEditProfileModalOpen]);

  // Refresh server-authoritative state when profile mounts
  useEffect(() => {
    if (currentUser?.id && !isEditProfileModalOpen) {
      refreshUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshUserData();
    setIsRefreshing(false);
    showToast('Data Refreshed', 'Your profile, plans, and wishlist are synced with the server.', 'success');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name Required', 'Please enter your full name.', 'warning');
      return;
    }

    const cleanPhoneDigits = editPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhoneDigits.length !== 10) {
      showToast('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number.', 'warning');
      return;
    }

    if (editNewPassword.trim()) {
      if (editNewPassword.trim().length < 6) {
        showToast('Password Too Short', 'New password must be at least 6 characters long.', 'warning');
        return;
      }
      if (editNewPassword.trim() !== editConfirmPassword.trim()) {
        showToast('Passwords Mismatch', 'New password and confirm password do not match.', 'error');
        return;
      }
    }

    const locationDisplay = [editArea.trim(), editCity.trim(), editState.trim()].filter(Boolean).join(', ');

    const payload: Record<string, any> = {
      name: editName.trim(),
      fullName: editName.trim(),
      phone: `+91${cleanPhoneDigits}`,
      mobile: `+91${cleanPhoneDigits}`,
      email: editEmail.trim(),
      area: editArea.trim(),
      locality: editArea.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      postal_code: editPincode.trim(),
      pincode: editPincode.trim(),
      formatted_address: editAddress.trim() || locationDisplay,
      street: editAddress.trim(),
      location: editAddress.trim() || locationDisplay,
      location_name: locationDisplay
    };

    if (editNewPassword.trim()) {
      payload.password = editNewPassword.trim();
    }

    const res = await updateUserProfile(payload);

    if (res.success) {
      setEditNewPassword('');
      setEditConfirmPassword('');
      setIsEditProfileModalOpen(false);
    }
  };

  const handleRequestMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError(null);
    const cleanDigits = newMobileInput.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setMobileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setIsSubmittingMobile(true);
    const res = await requestMobileChangeOtp(newMobileInput);
    setIsSubmittingMobile(false);
    if (res.success) {
      setMobileChangeStep('otp');
      if (res.devOtp) setDevOtpHint(res.devOtp);
    } else {
      setMobileError(res.error || 'Failed to send OTP to new mobile.');
    }
  };

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError(null);
    if (!mobileOtpInput.trim() || mobileOtpInput.trim().length !== 6) {
      setMobileError('Please enter the 6-digit OTP code.');
      return;
    }
    setIsSubmittingMobile(true);
    const res = await changeUserMobile(newMobileInput, mobileOtpInput.trim());
    setIsSubmittingMobile(false);
    if (res.success) {
      setIsChangeMobileModalOpen(false);
      setMobileChangeStep('input');
      setNewMobileInput('');
      setMobileOtpInput('');
      setDevOtpHint(null);
      await refreshUserData();
    } else {
      setMobileError(res.error || 'Failed to verify OTP.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password Too Short', 'Password must be at least 6 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords Mismatch', 'New password and confirm password do not match.', 'error');
      return;
    }

    await updateUserProfile({ password: newPassword });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangePasswordModalOpen(false);
    showToast('Password Updated', 'Your account password has been changed successfully.', 'success');
  };

  // Status calculation based on server dates
  const calculatePlanStatus = (expiresAt: string, currentStatus?: string) => {
    if (currentStatus === 'CANCELLED') {
      return { 
        status: 'CANCELLED', 
        daysRemaining: 0, 
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' 
      };
    }
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffMs = expiryTime - now;
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (diffMs <= 0) {
      return { 
        status: 'EXPIRED', 
        daysRemaining: 0, 
        badgeClass: 'bg-red-50 text-red-700 border-red-200' 
      };
    }
    if (daysRemaining <= 7) {
      return { 
        status: 'EXPIRING SOON', 
        daysRemaining, 
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' 
      };
    }
    return { 
      status: 'ACTIVE', 
      daysRemaining, 
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    };
  };

  // If user is not logged in: Guest Prompt
  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 bg-[#F7F9FC]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#DCE3EC] p-8 sm:p-10 text-center shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#77101F]/10 text-[#77101F] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#101828] font-display">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-[#667085] mt-2 leading-relaxed">
              Access your personal OnRoadPriz dashboard, saved vehicle wishlist, active buyer & seller subscriptions, and listing management.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3 px-6 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In with Mobile OTP / Password</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#101828] text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              Return to Marketplace Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter user's saved wishlist vehicles
  const savedVehicles = vehicles.filter(v => wishlist.includes(v.id));

  // Filter user's created listings
  const myListings = vehicles.filter(v => 
    v.sellerId === currentUser.id ||
    v.ownerPhone === currentUser.phone ||
    (v.seller && (v.seller.phone === currentUser.phone || v.seller.email === currentUser.email || v.seller.id === currentUser.id))
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header & Breadcrumb */}
        <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#77101F] to-[#5E0B17] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0">
              {(currentUser.name || currentUser.fullName || currentUser.phone || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#101828] font-display">
                  {currentUser.name || currentUser.fullName || 'Member Account'}
                </h1>
                {(activeSellerPlan || activeBuyerPlan) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    {activeSellerPlan?.planName || activeBuyerPlan?.planName}
                  </span>
                )}
                {currentUser.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#667085] mt-1 flex items-center gap-3 flex-wrap">
                <span>Mobile: {currentUser.phone?.startsWith('+91') ? currentUser.phone : '+91 ' + (currentUser.phone || 'Not linked')}</span>
                {currentUser.email ? (
                  <span>• Email: {currentUser.email}</span>
                ) : (
                  <span className="text-slate-400 italic">• Email: Not provided</span>
                )}
                {currentUser.city && (
                  <span className="flex items-center gap-1 text-[#77101F] font-semibold">
                    <MapPin className="w-3 h-3" />
                    {currentUser.city}{currentUser.state ? `, ${currentUser.state}` : ''}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl border border-[#DCE3EC] hover:border-[#77101F] text-xs font-bold text-[#101828] bg-white hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Refresh server data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#77101F] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            <button
              onClick={openEditProfileModal}
              className="px-4 py-2 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Admin Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Active Plans</span>
            {(activeBuyerPlan || activeSellerPlan) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Plan History ({planHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>My Activity</span>
            {savedVehicles.length > 0 && (
              <span className="text-[10px] bg-[#77101F]/20 text-[#77101F] px-1.5 py-0.2 rounded-full font-bold">
                {savedVehicles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security & Settings</span>
          </button>
        </div>

        {/* TAB CONTENT 1: MY PROFILE SUMMARY */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Account Summary Card */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EC]">
                <h3 className="text-base font-bold text-[#101828]">Account Information</h3>
                <button
                  onClick={openEditProfileModal}
                  className="text-xs font-bold text-[#77101F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1">
                  <span className="text-[#667085] font-medium">Full Name</span>
                  <p className="text-sm font-bold text-[#101828]">
                    {currentUser.name || currentUser.fullName || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085] font-medium">Mobile Number</span>
                    <button
                      onClick={() => {
                        setIsChangeMobileModalOpen(true);
                        setMobileChangeStep('input');
                        setNewMobileInput('');
                        setMobileOtpInput('');
                        setMobileError(null);
                        setDevOtpHint(null);
                      }}
                      className="text-[11px] font-bold text-[#77101F] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Change Mobile</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#101828]">
                      {currentUser.phone?.startsWith('+91') ? currentUser.phone : '+91 ' + (currentUser.phone || 'Not verified')}
                    </p>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Verified OTP
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085] font-medium">Email Address</span>
                    {!currentUser.email && (
                      <button
                        onClick={openEditProfileModal}
                        className="text-[11px] font-bold text-[#77101F] hover:underline"
                      >
                        Add Email
                      </button>
                    )}
                  </div>
                  {currentUser.email ? (
                    <p className="text-sm font-bold text-[#101828] flex items-center gap-2">
                      <span>{currentUser.email}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Linked
                      </span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-500 italic">
                        Email: Not provided
                      </p>
                      <button
                        onClick={openEditProfileModal}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#77101F]/10 text-[#77101F] hover:bg-[#77101F]/20 border border-[#77101F]/20 transition-colors"
                      >
                        + Add Email
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085] font-medium">Marketplace Location</span>
                    <button
                      onClick={() => setLocationModalOpen(true)}
                      className="text-xs font-bold text-[#77101F] hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{currentUser.city ? 'Change Location' : 'Set Location'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#101828]">
                      {currentUser.formatted_address || (currentUser.city ? `${currentUser.city}${currentUser.state ? ', ' + currentUser.state : ''}` : 'Select Location')}
                    </p>
                    {currentUser.location_source && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {currentUser.location_source}
                      </span>
                    )}
                    {currentUser.location_accuracy_meters && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        ±{Math.round(currentUser.location_accuracy_meters)}m
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#667085] font-medium">Area / Locality &amp; PIN Code</span>
                  <p className="text-sm font-bold text-[#101828]">
                    {[currentUser.area === 'All Places' ? '' : (currentUser.area || (currentUser.locality === 'All Places' ? '' : currentUser.locality)), currentUser.postal_code || currentUser.pincode].filter(Boolean).join(' • ') || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085] font-medium">Account Password</span>
                    <button
                      onClick={openEditProfileModal}
                      className="text-[11px] font-bold text-[#77101F] hover:underline cursor-pointer"
                    >
                      Change Password
                    </button>
                  </div>
                  <p className="text-sm font-bold text-[#101828] tracking-widest">
                    ••••••••
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[#667085] font-medium">Account Member Since</span>
                  <p className="text-sm font-bold text-[#101828]">
                    {currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '2026'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[#667085] font-medium">Verification Status</span>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Direct-Owner Verified Account
                  </p>
                </div>
              </div>

              {/* Quick Action Strip */}
              <div className="pt-4 border-t border-[#DCE3EC] flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/wishlist')}
                  className="px-4 py-2.5 rounded-xl bg-[#F7F9FC] hover:bg-[#77101F]/5 text-xs font-bold text-[#101828] border border-[#DCE3EC] flex items-center gap-2 transition-colors"
                >
                  <Heart className="w-4 h-4 text-[#77101F]" />
                  <span>View Wishlist ({wishlist.length})</span>
                </button>

                <button
                  onClick={() => navigate('/sell')}
                  className="px-4 py-2.5 rounded-xl bg-[#F7F9FC] hover:bg-[#77101F]/5 text-xs font-bold text-[#101828] border border-[#DCE3EC] flex items-center gap-2 transition-colors"
                >
                  <Car className="w-4 h-4 text-[#77101F]" />
                  <span>My Vehicle Listings ({myListings.length})</span>
                </button>

                <button
                  onClick={() => navigate('/plans')}
                  className="px-4 py-2.5 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Browse Membership Plans</span>
                </button>
              </div>
            </div>

            {/* Side Overview / Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Membership Overview
                </h4>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#F7F9FC] border border-[#DCE3EC]/70 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-[#667085]">Buyer Contact Pass</span>
                      <p className="text-xs font-bold text-[#101828]">
                        {activeBuyerPlan ? activeBuyerPlan.planName : (currentUser.buyerPlan?.name || 'Free Open Access')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeBuyerPlan || currentUser.buyerPlan ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {activeBuyerPlan || currentUser.buyerPlan ? 'ACTIVE' : 'STANDARD'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F7F9FC] border border-[#DCE3EC]/70 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-[#667085]">Seller Listing Plan</span>
                      <p className="text-xs font-bold text-[#101828]">
                        {activeSellerPlan ? activeSellerPlan.planName : (currentUser.sellerPlan?.name || (currentUser.role === 'Seller' ? (currentUser.activePlan || 'Standard Owner Plan') : 'No Active Plan'))}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeSellerPlan || currentUser.sellerPlan || currentUser.role === 'Seller' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {activeSellerPlan || currentUser.sellerPlan || currentUser.role === 'Seller' ? 'ACTIVE' : 'REQUIRED TO SELL'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="w-full py-2 px-3 text-xs font-bold text-[#77101F] hover:bg-[#77101F]/5 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Plan Details & Entitlements</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-gradient-to-br from-[#77101F]/10 via-[#77101F]/5 to-transparent rounded-3xl border border-[#77101F]/20 p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-[#77101F]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold text-xs">Direct Owner Protection</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  OnRoadPriz connects verified owners directly with buyers. Never pay off-platform deposits or advance reservation tokens.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: ACTIVE PLANS */}
        {activeTab === 'plans' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#101828] font-display">Active Memberships & Entitlements</h3>
                <p className="text-xs text-[#667085]">Authoritative server calculations synchronized across all your devices.</p>
              </div>
              <button
                onClick={() => navigate('/plans')}
                className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span>Explore Plans Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* BUYER PLAN CARD */}
              <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">Membership Category</span>
                        <h4 className="text-sm font-bold text-[#101828]">BUYER PLAN</h4>
                      </div>
                    </div>

                    {activeBuyerPlan ? (
                      (() => {
                        const { status, badgeClass } = calculatePlanStatus(activeBuyerPlan.expiresAt, activeBuyerPlan.status);
                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {status}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        STANDARD BUYER
                      </span>
                    )}
                  </div>

                  {activeBuyerPlan ? (
                    <div className="pt-4 space-y-3.5 text-xs">
                      <div>
                        <span className="text-[#667085] font-medium">Plan Name</span>
                        <p className="text-base font-black text-[#101828] font-display">{activeBuyerPlan.planName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/60 space-y-1">
                          <span className="text-[#667085] text-[11px]">Activation Date</span>
                          <p className="font-bold text-[#101828]">
                            {new Date(activeBuyerPlan.activatedAt || activeBuyerPlan.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/60 space-y-1">
                          <span className="text-[#667085] text-[11px]">Expiry Date</span>
                          <p className="font-bold text-[#101828]">
                            {new Date(activeBuyerPlan.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                        <span className="text-emerald-800 font-semibold text-[11px]">Days Remaining:</span>
                        <span className="text-emerald-900 font-black text-sm">
                          {calculatePlanStatus(activeBuyerPlan.expiresAt).daysRemaining} Days
                        </span>
                      </div>

                      {/* Contact Unlocks Quota Breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2.5 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/70">
                          <span className="text-[10px] text-[#667085] block">Allowed</span>
                          <span className="text-sm font-black text-[#101828]">
                            {activeBuyerPlan.viewsAllowed ?? currentUser.buyerPlan?.listingViewsAllowed ?? 25}
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/70">
                          <span className="text-[10px] text-[#667085] block">Unlocked</span>
                          <span className="text-sm font-black text-[#77101F]">
                            {activeBuyerPlan.viewsUsed ?? Math.max(0, (activeBuyerPlan.viewsAllowed ?? 25) - (activeBuyerPlan.viewsRemaining ?? 25))}
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/70">
                          <span className="text-[10px] text-[#667085] block">Remaining</span>
                          <span className="text-sm font-black text-emerald-700">
                            {activeBuyerPlan.viewsRemaining ?? currentUser.buyerPlan?.listingViewsRemaining ?? 25}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[#667085] font-semibold text-[11px]">Usage & Entitlements:</span>
                        <ul className="space-y-1 text-[#101828] text-xs">
                          <li className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Direct Owner Phone & WhatsApp access enabled</span>
                          </li>
                          <li className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Comprehensive RC, Insurance & PUC document audit</span>
                          </li>
                          <li className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>0% Commission direct owner transactions</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-[#667085] max-w-xs mx-auto">
                        You currently do not have an active premium Buyer Pass. Purchase a plan to unlock verified owner contact numbers and inspection documents.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/plans/buyer')}
                    className="w-full py-2.5 px-4 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{activeBuyerPlan ? 'Upgrade / Renew Buyer Plan' : 'Browse Buyer Plans'}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* SELLER PLAN CARD */}
              <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">Membership Category</span>
                        <h4 className="text-sm font-bold text-[#101828]">SELLER PLAN</h4>
                      </div>
                    </div>

                    {activeSellerPlan ? (
                      (() => {
                        const { status, badgeClass } = calculatePlanStatus(activeSellerPlan.expiresAt, activeSellerPlan.status);
                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {status}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        INACTIVE
                      </span>
                    )}
                  </div>

                  {activeSellerPlan ? (
                    <div className="pt-4 space-y-3.5 text-xs">
                      <div>
                        <span className="text-[#667085] font-medium">Plan Name</span>
                        <p className="text-base font-black text-[#101828] font-display">{activeSellerPlan.planName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/60 space-y-1">
                          <span className="text-[#667085] text-[11px]">Activation Date</span>
                          <p className="font-bold text-[#101828]">
                            {new Date(activeSellerPlan.activatedAt || activeSellerPlan.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/60 space-y-1">
                          <span className="text-[#667085] text-[11px]">Expiry Date</span>
                          <p className="font-bold text-[#101828]">
                            {new Date(activeSellerPlan.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 flex items-center justify-between">
                        <span className="text-purple-800 font-semibold text-[11px]">Days Remaining:</span>
                        <span className="text-purple-900 font-black text-sm">
                          {calculatePlanStatus(activeSellerPlan.expiresAt).daysRemaining} Days
                        </span>
                      </div>

                      {/* Listings Quota Breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2.5 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/70">
                          <span className="text-[10px] text-[#667085] block">Allowed</span>
                          <span className="text-sm font-black text-[#101828]">
                            {activeSellerPlan.listingsAllowed ?? 1}
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/70">
                          <span className="text-[10px] text-[#667085] block">Active / Used</span>
                          <span className="text-sm font-black text-[#77101F]">
                            {activeSellerPlan.listingsUsed ?? myListings.length}
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC]/70">
                          <span className="text-[10px] text-[#667085] block">Remaining</span>
                          <span className="text-sm font-black text-emerald-700">
                            {Math.max(0, (activeSellerPlan.listingsAllowed ?? 1) - (activeSellerPlan.listingsUsed ?? myListings.length))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-[#667085] max-w-xs mx-auto">
                        An active Seller Plan is required to publish vehicle listings and reach thousands of verified buyers directly without dealer cuts.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/plans/seller')}
                    className="w-full py-2.5 px-4 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{activeSellerPlan ? 'Upgrade / Renew Seller Plan' : 'Purchase Seller Plan to List Vehicle'}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: PLAN HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EC]">
              <div>
                <h3 className="text-base font-bold text-[#101828]">Plan Purchase & Subscription History</h3>
                <p className="text-xs text-[#667085]">All past invoices and active memberships associated with your mobile identity.</p>
              </div>
            </div>

            {planHistory.length === 0 ? (
              <div className="py-12 text-center space-y-4 bg-[#F7F9FC] rounded-2xl border border-dashed border-[#DCE3EC]">
                <Receipt className="w-12 h-12 text-[#667085]/40 mx-auto" />
                <p className="text-xs text-[#667085] max-w-sm mx-auto">
                  No previous plan purchases on file. Subscribe to a Buyer or Seller plan to see invoices and dates recorded here.
                </p>
                <button
                  onClick={() => navigate('/plans')}
                  className="px-5 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Explore Membership Plans
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE3EC] text-[#667085] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Plan Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Purchase Date</th>
                      <th className="py-3 px-3">Start Date</th>
                      <th className="py-3 px-3">Expiry Date</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3 text-right">Plan Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3EC]/70">
                    {planHistory.map((sub) => {
                      const { status, badgeClass } = calculatePlanStatus(sub.expiresAt, sub.status);
                      return (
                        <tr key={sub.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="py-3.5 px-3 font-bold text-[#101828]">{sub.planName}</td>
                          <td className="py-3.5 px-3">
                            <span className="uppercase text-[10px] font-bold text-[#667085]">
                              {sub.planType}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-[#77101F]">
                            ₹{sub.totalAmount || sub.baseAmount || 0}
                          </td>
                          <td className="py-3.5 px-3 text-[#667085]">
                            {new Date(sub.purchasedAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-[#667085]">
                            {new Date(sub.activatedAt || sub.purchasedAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-[#667085]">
                            {new Date(sub.expiresAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              SUCCESS ({sub.paymentGateway || 'UPI'})
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 4: MY ACTIVITY (WISHLIST, LISTINGS & PURCHASES) */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* Sub-section: Saved Wishlist */}
            <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#77101F] fill-[#77101F]" />
                  <h3 className="text-base font-bold text-[#101828]">Saved Wishlist Vehicles ({wishlist.length})</h3>
                </div>
                {wishlist.length > 0 && (
                  <button
                    onClick={() => navigate('/wishlist')}
                    className="text-xs font-bold text-[#77101F] hover:underline"
                  >
                    Open Full Wishlist Page →
                  </button>
                )}
              </div>

              {savedVehicles.length === 0 ? (
                <div className="py-8 text-center space-y-2 bg-[#F7F9FC] rounded-2xl border border-dashed border-[#DCE3EC]">
                  <p className="text-xs text-[#667085]">No saved vehicles in your wishlist. Click the heart icon on any vehicle to save it here.</p>
                  <button
                    onClick={() => navigate('/buy')}
                    className="px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl"
                  >
                    Browse Vehicles
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedVehicles.map(v => (
                    <div key={v.id} className="p-3 bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC] flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="h-32 rounded-xl overflow-hidden bg-slate-200 relative">
                          <img 
                            src={v.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'} 
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => toggleWishlist(v.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-600 hover:scale-110 transition-transform shadow-xs"
                            title="Remove from Saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-[#101828] line-clamp-1">{v.title}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-[#77101F]">₹{v.price.toLocaleString('en-IN')}</span>
                          <span className="text-[11px] text-[#667085]">
                            {typeof v.location === 'object' && v.location ? `${v.location.city}${v.location.state ? ', ' + v.location.state : ''}` : String(v.location || 'India')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/vehicle/${v.id}`)}
                        className="w-full py-2 bg-white hover:bg-[#77101F] hover:text-white border border-[#DCE3EC] text-xs font-bold rounded-xl transition-colors text-center"
                      >
                        View Vehicle Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-section: My Vehicle Listings */}
            <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#77101F]" />
                  <h3 className="text-base font-bold text-[#101828]">My Vehicle Listings ({myListings.length})</h3>
                </div>
                <button
                  onClick={() => navigate('/sell')}
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List a Vehicle</span>
                </button>
              </div>

              {myListings.length === 0 ? (
                <div className="py-8 text-center space-y-3 bg-[#F7F9FC] rounded-2xl border border-dashed border-[#DCE3EC]">
                  <p className="text-xs text-[#667085]">You haven't listed any vehicles yet. List your car, bike, tractor, or lorry with 0% brokerage.</p>
                  <button
                    onClick={() => navigate('/sell')}
                    className="px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl"
                  >
                    Sell Your Vehicle Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map(v => (
                    <div key={v.id} className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#DCE3EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <img 
                            src={v.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80'} 
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#101828]">{v.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-[#667085] mt-0.5">
                            <span className="font-bold text-[#77101F]">₹{v.price.toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span>{v.year} • {v.kmDriven ? `${v.kmDriven.toLocaleString('en-IN')} km` : ''}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-[#667085]" />
                              {v.views || v.viewsCount || 0} views
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${v.status === 'Sold' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {v.status || 'Published'}
                        </span>
                        <button
                          onClick={() => navigate(`/vehicle/${v.id}`)}
                          className="px-3 py-1.5 rounded-xl border border-[#DCE3EC] bg-white hover:bg-slate-50 text-xs font-bold text-[#101828]"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 5: SECURITY & SETTINGS */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Password Change Card */}
            <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EC]">
                <Lock className="w-4 h-4 text-[#77101F]" />
                <h3 className="text-base font-bold text-[#101828]">Account Security</h3>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                Update your login credentials. If you signed in via mobile OTP, you can establish a password for alternate email & password sign-in.
              </p>

              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="w-full py-2.5 px-4 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Change / Set Account Password</span>
              </button>
            </div>

            {/* Logout & Session Management */}
            <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EC]">
                  <LogOut className="w-4 h-4 text-red-600" />
                  <h3 className="text-base font-bold text-[#101828]">Sign Out Everywhere</h3>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed mt-4">
                  Terminating your session clears your authentication tokens, private wishlist sync, and security cookies from this browser window.
                </p>
              </div>

              <button
                onClick={logout}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of OnRoadPriz</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* EDIT DETAILS MODAL (ALL PROFILE FIELDS + PASSWORD) */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#101828] font-display">
                  Edit Profile Details &amp; Password
                </h3>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Update your personal information, contact details, location, and account password.
                </p>
              </div>
              <button 
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Row 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  required
                />
              </div>

              {/* Row 2: Mobile Number & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#101828]">Mobile Number *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditProfileModalOpen(false);
                        setIsChangeMobileModalOpen(true);
                        setMobileChangeStep('input');
                        setNewMobileInput('');
                        setMobileOtpInput('');
                        setMobileError(null);
                      }}
                      className="text-[10px] font-bold text-[#77101F] hover:underline cursor-pointer"
                    >
                      Verify via OTP
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#667085]">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs font-semibold text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: Area/Locality, City, State, PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    placeholder="e.g. Madhapur, Siripuram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. Telangana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 500081"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: Full Street / Address */}
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Full Address / Street</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                />
              </div>

              {/* Row 5: Change Password Section */}
              <div className="pt-3 border-t border-[#DCE3EC] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#77101F]" />
                    <span className="text-xs font-bold text-[#101828]">Update Password</span>
                  </div>
                  <span className="text-[10px] text-[#667085]">Leave blank to keep current password</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editNewPassword}
                        onChange={(e) => setEditNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">Confirm New Password</label>
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DCE3EC] text-xs font-bold text-[#667085] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save All Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="text-base font-bold text-[#101828]">Change Password</h3>
              <button 
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE3EC] text-xs font-bold text-[#667085] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE MOBILE NUMBER MODAL */}
      {isChangeMobileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#DCE3EC] p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#77101F]" />
                <h3 className="text-base font-bold text-[#101828]">Change Mobile Number</h3>
              </div>
              <button 
                onClick={() => setIsChangeMobileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mobileError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{mobileError}</span>
              </div>
            )}

            {mobileChangeStep === 'input' ? (
              <form onSubmit={handleRequestMobileOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">New Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#667085]">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={newMobileInput}
                      onChange={(e) => setNewMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-[#DCE3EC] text-xs text-[#101828] font-bold tracking-wide focus:border-[#77101F] focus:outline-hidden"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-[#667085] mt-1.5">
                    We will send a 6-digit verification code. Uniqueness is checked across the database.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangeMobileModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#DCE3EC] text-xs font-bold text-[#667085] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMobile || newMobileInput.length < 10}
                    className="px-5 py-2 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] disabled:bg-slate-300 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    {isSubmittingMobile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[#667085]">Verification code sent to:</span>
                  <div className="font-bold text-[#101828] mt-0.5">+91 {newMobileInput}</div>
                  {devOtpHint && (
                    <div className="mt-1 text-[11px] text-[#77101F] font-bold">
                      Testing OTP: {devOtpHint}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    value={mobileOtpInput}
                    onChange={(e) => setMobileOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full text-center tracking-[0.4em] font-mono font-bold text-lg py-2.5 rounded-xl border border-[#DCE3EC] text-[#101828] focus:border-[#77101F] focus:outline-hidden"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileChangeStep('input');
                      setMobileError(null);
                    }}
                    className="text-xs font-bold text-[#77101F] hover:underline"
                  >
                    Change Number
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangeMobileModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#DCE3EC] text-xs font-bold text-[#667085] hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingMobile || mobileOtpInput.length !== 6}
                      className="px-5 py-2 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] disabled:bg-slate-300 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      {isSubmittingMobile ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Update</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
