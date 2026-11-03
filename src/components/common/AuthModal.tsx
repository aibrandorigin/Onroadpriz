import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight,
  CheckCircle2,
  Loader2,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    users,
    register,
    loginWithEmail, 
    registerNewUser, 
    sendOtp, 
    verifyOtp,
    resetPasswordWithOtp,
    showToast,
    authReturnTo,
    setAuthReturnTo,
    selectedCity,
    selectedLocality,
    navigate
  } = useApp();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const onClose = propOnClose || (() => setAuthModalOpen(false));

  const [activeTab, setActiveTab] = useState<'otp' | 'email'>('otp');
  const [step, setStep] = useState<'input' | 'otp_verify'>('input');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Countdown timer for 60-second resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setIsVerifyingOtp(false);
      setIsSendingOtp(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePostAuthRedirect = () => {
    if (authReturnTo) {
      const target = authReturnTo;
      setAuthReturnTo(null);
      navigate(target);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendingOtp) return;

    setErrorMsg('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      setErrorMsg('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendOtp(cleanPhone);
      if (res.success) {
        setStep('otp_verify');
        setOtpCode('');
        setErrorMsg('');
        setCountdown(res.cooldownSeconds || 60);
      } else {
        setErrorMsg(res.error || 'Failed to send verification code. Please try again.');
        if (res.cooldownSeconds && res.cooldownSeconds > 0) {
          setCountdown(res.cooldownSeconds);
        }
      }
    } catch {
      setErrorMsg('Network error sending verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side submission lock: prevent double-clicks, Enter + click, and duplicate submissions
    if (isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    setErrorMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    const cleanOtp = otpCode.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      setIsVerifyingOtp(false);
      return;
    }

    try {
      const res = await verifyOtp(cleanPhone, cleanOtp, fullName);

      if (res.success && res.verified) {
        setErrorMsg('');
        setOtpCode('');

        // If in forgot password mode
        if (isForgotPassword) {
          if (!newPassword || newPassword.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            setIsVerifyingOtp(false);
            return;
          }
          const resetOk = resetPasswordWithOtp(cleanPhone, newPassword);
          if (resetOk) {
            setIsForgotPassword(false);
            onClose();
            handlePostAuthRedirect();
          }
          setIsVerifyingOtp(false);
          return;
        }

        onClose();
        handlePostAuthRedirect();
        setIsVerifyingOtp(false);
        return;
      }

      // Verification failed: display authoritative backend error message
      setErrorMsg(res.error || 'Invalid verification code. Please check and try again.');
    } catch {
      setErrorMsg('Connection error verifying code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }

    if (isSignUp) {
      const cleanName = (fullName || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      if (!cleanName) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!cleanPhone || cleanPhone.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      // Check duplicate email
      const emailExists = users.some(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
      if (emailExists) {
        setErrorMsg('This email address is already registered. Please log in or use forgot password.');
        return;
      }

      // Check duplicate phone
      const phoneExists = users.some(u => {
        const uDigits = (u.phone || u.mobile || '').replace(/\D/g, '').slice(-10);
        return uDigits && uDigits === cleanPhone;
      });
      if (phoneExists) {
        setErrorMsg('This mobile number is already registered to another user account. Please log in.');
        return;
      }

      const ok = register(cleanName, cleanEmail, cleanPhone, 'Buyer');
      if (ok) {
        onClose();
        handlePostAuthRedirect();
      }
    } else {
      const ok = await loginWithEmail(email, password);
      if (ok) {
        onClose();
        handlePostAuthRedirect();
      } else {
        setErrorMsg('Invalid email or password. Please check your credentials and try again.');
      }
    }
  };

  const maskedPhone = phone ? `******${phone.replace(/\D/g, '').slice(-4)}` : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#DCE3EC] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative p-6 pb-2 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#98A2B3] hover:text-[#101828] hover:bg-[#F5F7FA] rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ONROADPRIZ BRAND LOGO */}
          <div className="flex justify-center mb-3">
            <BrandLogo variant="auth" />
          </div>

          <h2 className="text-xl font-black text-[#101828] font-display">
            {isForgotPassword 
              ? 'Reset Account Password'
              : isSignUp 
                ? 'Create Your OnRoadPriz Account'
                : 'Welcome to OnRoadPriz'}
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            {isForgotPassword
              ? 'Verify your mobile via SMS OTP to set a new password'
              : 'Direct owner-to-buyer vehicle marketplace with zero brokerage.'}
          </p>

          {/* Mode Switcher Tabs (Only if not in forgot password mode) */}
          {!isForgotPassword && (
            <div className="flex items-center p-1 bg-[#F5F7FA] rounded-xl border border-[#DCE3EC] mt-4">
              <button
                type="button"
                onClick={() => { setActiveTab('otp'); setStep('input'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'otp'
                    ? 'bg-white text-[#77101F] shadow-xs'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (SMS OTP)</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('email'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-white text-[#77101F] shadow-xs'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email / Staff Login</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-2">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}



          {/* FORGOT PASSWORD VIA OTP */}
          {isForgotPassword ? (
            step === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5">
                    Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#F5F7FA] border border-r-0 border-[#DCE3EC] rounded-l-xl text-xs font-bold text-[#101828]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE3EC] rounded-r-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F]"
                    />
                  </div>
                  <p className="text-[11px] text-[#98A2B3] mt-1">
                    An official DLT verification code will be sent to your mobile.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setStep('input'); setErrorMsg(''); }}
                    className="text-xs font-bold text-[#77101F] hover:underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center py-1">
                  <p className="text-xs text-[#667085]">
                    Enter 6-digit code sent to <span className="font-bold text-[#101828]">+91 {maskedPhone}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => { setStep('input'); setErrorMsg(''); }}
                    className="text-[11px] text-[#77101F] font-bold hover:underline mt-0.5 cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">6-Digit SMS Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full text-center tracking-widest text-xl font-black py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#667085] mt-2">
                    <span>Didn't receive SMS?</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || isSendingOtp}
                      onClick={() => handleSendOtp()}
                      className="font-bold text-[#77101F] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">New Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Enter minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reset Password & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : activeTab === 'otp' ? (
            step === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5">
                    Full Name <span className="text-[#98A2B3] font-normal">(Optional for Sign In)</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#F5F7FA] border border-r-0 border-[#DCE3EC] rounded-l-xl text-xs font-bold text-[#101828]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE3EC] rounded-r-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F]"
                    />
                  </div>
                  <p className="text-[11px] text-[#98A2B3] mt-1">
                    An official DLT-approved verification code will be sent via SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending SMS Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[#667085]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure RTO & direct owner verification standard</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-xs text-[#667085]">
                    Enter 6-digit code sent to <span className="font-bold text-[#101828]">+91 {maskedPhone}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => { setStep('input'); setErrorMsg(''); }}
                    className="text-[11px] text-[#77101F] font-bold hover:underline mt-0.5 cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full text-center tracking-widest text-2xl font-black py-3 bg-white border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#667085] mt-2">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || isSendingOtp}
                      onClick={() => handleSendOtp()}
                      className="font-bold text-[#77101F] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Proceed</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Praveen Varma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#F5F7FA] border border-r-0 border-[#DCE3EC] rounded-l-xl text-xs font-bold text-[#101828]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE3EC] rounded-r-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>
                  <p className="text-[10px] text-[#98A2B3] mt-1">
                    Each account requires a unique mobile number.
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#101828]">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setStep('input');
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-semibold text-[#77101F] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isSignUp ? 'Create Account' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Bottom Switcher: Sign Up vs Sign In */}
          {!isForgotPassword && activeTab === 'email' && (
            <div className="text-center mt-5 pt-4 border-t border-[#DCE3EC] text-xs text-[#667085]">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                    className="font-bold text-[#77101F] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                    className="font-bold text-[#77101F] hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
