import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resolveApiUrl } from '../../services/apiConfig';

export const AccountDeletionPage: React.FC = () => {
  const { currentUser, logout, navigate, showToast } = useApp();
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');
  const [reason, setReason] = useState('No longer using the service');
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCheck) {
      showToast('Confirmation Required', 'Please confirm that you understand the data deletion implications.', 'warning');
      return;
    }
    if (!mobileNumber.trim()) {
      showToast('Mobile Number Required', 'Please provide the registered mobile number for the account.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('orp_auth_token') || '';
      const response = await fetch(resolveApiUrl('/api/account-deletion'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber.trim(),
          reason
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast('Deletion Request Failed', data.error || 'Please enter a valid 10-digit Indian mobile number.', 'error');
        setIsSubmitting(false);
        return;
      }

      if (data.requestId) {
        setRequestId(data.requestId);
      }
      setSubmitted(true);
      if (data.immediateDeletion && currentUser) {
        logout();
      }
      showToast('Request Processed', 'Your account and data deletion request has been registered.', 'info');
    } catch {
      showToast('Network Error', 'Could not reach server. Please try again or email support@onroadpriz.com.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77101F] hover:underline mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to OnRoadPriz</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Request Account & Data Deletion</h1>
            <p className="text-xs text-slate-500 mt-0.5">OnRoadPriz Android & Web User Account Termination</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Deletion Request Initiated</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We have received your account deletion request for registered number <strong>{mobileNumber}</strong>. 
              Your active vehicle listings, profile details, and wishlist will be permanently removed.
            </p>
            <p className="text-[11px] text-slate-500">
              Per Google Play and regulatory guidelines, financial records and completed transaction invoices will be securely archived for statutory audit retention.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17] transition-all"
            >
              Return to Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>What Happens When You Delete Your Account</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1 text-[11px]">
                <li>All your active vehicle listings will be unpublished from the marketplace.</li>
                <li>Your saved wishlist, profile preferences, and session tokens will be permanently erased.</li>
                <li>Your mobile number will be released from our authentication registry.</li>
                <li>Historical payment receipt logs are archived in read-only form for taxation compliance.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Registered Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#77101F] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Account Deletion (Optional)</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#77101F] focus:outline-hidden bg-white"
              >
                <option value="No longer using the service">I no longer need this service</option>
                <option value="Sold my vehicle">I have already sold my vehicle</option>
                <option value="Privacy concerns">Privacy concerns</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="confirm-delete"
                checked={confirmedCheck}
                onChange={(e) => setConfirmedCheck(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#77101F] focus:ring-[#77101F]"
              />
              <label htmlFor="confirm-delete" className="text-xs text-slate-600 leading-tight">
                I understand that this action is irreversible and all my published vehicle listings and saved preferences will be permanently deleted.
              </label>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !confirmedCheck}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Submit Deletion Request</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Google Play Account Deletion Policy Compliant</span>
        </div>
      </div>
    </div>
  );
};
