import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerReport, ContactSubmission, Testimonial, AuditLog, PlatformSettings, VehicleCategory, CategoryFieldRule } from '../../types';
import { getVersionedAssetUrl, CANONICAL_BRAND_LOGO, BrandLogo } from '../common/BrandLogo';
import { 
  ShieldAlert, 
  Mail, 
  MessageSquare, 
  Bell, 
  Clock, 
  Settings, 
  Search, 
  Check, 
  X, 
  Eye, 
  Edit2, 
  Trash2, 
  Plus, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Save,
  Layers,
  SlidersHorizontal,
  Loader2,
  Upload,
  Key
} from 'lucide-react';
import { SecretsConfigTab } from './SecretsConfigTab';

interface ModerationTabProps {
  activeSection: 'reports' | 'contacts' | 'testimonials' | 'notifications' | 'audit' | 'settings';
}

export const ModerationTab: React.FC<ModerationTabProps> = ({ activeSection }) => {
  const { 
    sellerReports, 
    updateSellerReport, 
    deleteSellerReport, 
    contactSubmissions, 
    updateContactStatus, 
    deleteContactSubmission, 
    testimonials, 
    addTestimonial, 
    deleteTestimonial, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearNotifications, 
    auditLogs, 
    addAuditLog, 
    settings, 
    updateSettings, 
    showToast,
    navigate 
  } = useApp();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Seller Report Inspection Modal
  const [selectedReport, setSelectedReport] = useState<SellerReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Contact Inquiry Inspection Modal & Filters
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [contactFilterStatus, setContactFilterStatus] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');

  // Testimonial Modal
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [testName, setTestName] = useState('');
  const [testQuote, setTestQuote] = useState('');
  const [testVehicle, setTestVehicle] = useState('2022 Hyundai Creta');
  const [testRating, setTestRating] = useState(5);

  // Settings State Form
  const [formSettings, setFormSettings] = useState<PlatformSettings>({ ...settings });
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'fields' | 'secrets'>('general');
  const [selectedFieldsCategory, setSelectedFieldsCategory] = useState<VehicleCategory>('Cars');
  const [isUploadingBranding, setIsUploadingBranding] = useState<Record<string, boolean>>({});
  const [isSavingGlobalSettings, setIsSavingGlobalSettings] = useState(false);
  const [showBrandingPreviewModal, setShowBrandingPreviewModal] = useState(false);

  // Reset all branding to official master assets
  const handleResetToOfficialBranding = () => {
    setFormSettings(prev => ({
      ...prev,
      websiteLogo: CANONICAL_BRAND_LOGO,
      logoUrl: CANONICAL_BRAND_LOGO,
      logo_url: CANONICAL_BRAND_LOGO,
      mobileLogo: '',
      adminLogo: '',
      favicon: '/favicon.svg',
      faviconUrl: '/favicon.svg',
      favicon_url: '/favicon.svg'
    }));
    setPendingFiles({});
    showToast('Branding Reset', 'Loaded official OnRoadPriz master logo and favicon. Click "Save Changes" to publish globally.', 'info');
  };

  // Pending local preview files before permanent server upload
  const [pendingFiles, setPendingFiles] = useState<Record<string, { file: File; previewUrl: string }>>({});

  // Sync formSettings whenever authoritative server settings update
  useEffect(() => {
    setFormSettings({ ...settings });
  }, [settings]);

  const handleSelectFile = (
    fieldKey: 'websiteLogo' | 'mobileLogo' | 'adminLogo' | 'favicon',
    file: File
  ) => {
    if (pendingFiles[fieldKey]?.previewUrl) {
      URL.revokeObjectURL(pendingFiles[fieldKey].previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingFiles(prev => ({ ...prev, [fieldKey]: { file, previewUrl } }));
  };

  const handleDiscardPending = (fieldKey: 'websiteLogo' | 'mobileLogo' | 'adminLogo' | 'favicon') => {
    if (pendingFiles[fieldKey]?.previewUrl) {
      URL.revokeObjectURL(pendingFiles[fieldKey].previewUrl);
    }
    setPendingFiles(prev => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  // Upload logo/favicon to permanent cloud/server storage & publish globally
  const handleUploadAndSaveAsset = async (
    fieldKey: 'websiteLogo' | 'mobileLogo' | 'adminLogo' | 'favicon',
    assetType: 'logo' | 'mobile_logo' | 'admin_logo' | 'favicon'
  ) => {
    const pending = pendingFiles[fieldKey];
    if (!pending) return;

    setIsUploadingBranding(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(pending.file);
      });

      const res = await fetch('/api/admin/branding/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          filename: pending.file.name,
          type: assetType
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server failed to store branding asset permanently');
      }

      const uploadResult = await res.json();
      const permanentUrl = uploadResult.url;

      // Update form settings with permanent server URL
      const updated = { 
        ...formSettings, 
        [fieldKey]: permanentUrl,
        ...(fieldKey === 'websiteLogo' ? { logoUrl: permanentUrl } : {}),
        ...(fieldKey === 'favicon' ? { faviconUrl: permanentUrl } : {})
      };
      setFormSettings(updated);

      // Clean up pending preview
      URL.revokeObjectURL(pending.previewUrl);
      setPendingFiles(prev => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });

      // Instantly persist to global site settings database on the server
      const saved = await updateSettings(updated);
      if (saved) {
        showToast('Logo Updated Successfully', `${pending.file.name} saved permanently and broadcast globally across all browsers.`, 'success');
      }
    } catch (err: any) {
      console.error('[Branding] Asset upload failed:', err);
      showToast('Upload Failed', `Could not upload branding asset: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsUploadingBranding(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  // -------------------------------------------------------------
  // 1. SELLER REPORTS VIEW
  // -------------------------------------------------------------
  if (activeSection === 'reports') {
    const totalReports = sellerReports.length;
    const openReports = sellerReports.filter(r => r.status === 'Open' || !r.status).length;
    const reviewReports = sellerReports.filter(r => r.status === 'Under Review').length;
    const resolvedReports = sellerReports.filter(r => r.status === 'Resolved').length;

    const handleUpdateReportStatus = (status: string) => {
      if (!selectedReport) return;
      updateSellerReport(selectedReport.id, { 
        status: status as any, 
        adminNotes: adminNotes || selectedReport.adminNotes 
      });
      addAuditLog({
        action: `Report ${status}`,
        module: 'Seller Moderation',
        recordId: selectedReport.id,
        oldValue: `Status: ${selectedReport.status || 'Open'}`,
        newValue: `Status: ${status} (Notes: ${adminNotes})`
      });
      setSelectedReport(null);
      setAdminNotes('');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Seller Reports & Disputes
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                {totalReports} Reported Incidents
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Investigate buyer complaints, odometer tampering claims, unauthorized brokers, and fraud reports.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Reports</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalReports}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-600 uppercase">Open Claims</span>
            <div className="text-2xl font-black text-rose-700 mt-1">{openReports}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Under Review</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{reviewReports}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Resolved</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedReports}</div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Reported Seller</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Alleged Reason</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerReports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{r.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{r.sellerName || 'Direct Owner'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.reporterName} ({r.reporterPhone})</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 truncate max-w-[180px]">{r.vehicleTitle || 'Listing'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Resolved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : r.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status || 'Open'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReport(r);
                          setAdminNotes(r.adminNotes || '');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Investigate Seller Dispute</h3>
                <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 space-y-1">
                <span className="font-bold text-rose-900 block">{selectedReport.reason}</span>
                <p className="text-slate-600">{selectedReport.details || 'Buyer reported discrepancies between physical vehicle inspection and online listing specifications.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Reported Seller</span>
                  <span className="font-semibold text-slate-800">{selectedReport.sellerName || 'Direct Owner'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Buyer Details</span>
                  <span className="font-semibold text-slate-800">{selectedReport.reporterName} ({selectedReport.reporterPhone})</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Moderator Review Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record verification findings, contact history with owner, or warning status..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleUpdateReportStatus('Rejected')}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Dismiss Report
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateReportStatus('Under Review')}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs"
                  >
                    Flag Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateReportStatus('Resolved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    Resolve Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. CONTACT SUBMISSIONS VIEW (Help Center Inquiries)
  // -------------------------------------------------------------
  if (activeSection === 'contacts') {
    const newCount = contactSubmissions.filter(c => !c.status || c.status === 'new').length;
    const inProgressCount = contactSubmissions.filter(c => c.status === 'in_progress').length;
    const resolvedCount = contactSubmissions.filter(c => c.status === 'resolved').length;

    const filteredContacts = contactSubmissions.filter(c => {
      const matchesStatus =
        contactFilterStatus === 'all' ||
        (contactFilterStatus === 'new' && (!c.status || c.status === 'new')) ||
        c.status === contactFilterStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.message || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Help Center Inquiries & Contact Submissions
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#77101F]/10 text-[#77101F]">
                {contactSubmissions.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inquiries submitted by buyers and sellers from the Help Center contact form.
            </p>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Open Help Center</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inquiries</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{contactSubmissions.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-600 uppercase">New / Unread</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{newCount}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-600 uppercase">In Progress</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{inProgressCount}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Resolved</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              { id: 'all', label: `All (${contactSubmissions.length})` },
              { id: 'new', label: `New (${newCount})` },
              { id: 'in_progress', label: `In Progress (${inProgressCount})` },
              { id: 'resolved', label: `Resolved (${resolvedCount})` }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setContactFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  contactFilterStatus === tab.id
                    ? 'bg-[#77101F] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, subject..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
            />
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Inquiry Message</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No Help Center inquiries match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-mono font-semibold text-slate-800">{c.phone || '—'}</div>
                        <div className="text-[11px] text-slate-500">{c.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{c.subject}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{c.message}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {c.createdAt ? c.createdAt.replace('T', ' ').slice(0, 16) : 'Just now'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {c.status === 'in_progress' ? 'In Progress' : (c.status || 'new')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedContact(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => updateContactStatus(c.id, c.status === 'resolved' ? 'new' : 'resolved')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]"
                          >
                            {c.status === 'resolved' ? 'Reopen' : 'Resolve'}
                          </button>
                          <button
                            onClick={() => deleteContactSubmission(c.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inquiry Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#77101F]">Help Center Inquiry</span>
                  <h3 className="font-bold text-slate-900 text-base">{selectedContact.subject}</h3>
                </div>
                <button onClick={() => setSelectedContact(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sender Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedContact.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted At</span>
                  <span className="font-mono text-slate-700">
                    {selectedContact.createdAt ? selectedContact.createdAt.replace('T', ' ').slice(0, 19) : 'Just now'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedContact.phone || 'Not provided'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                  <span className="font-mono text-slate-800 break-all">{selectedContact.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F9FC] rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Message Details</span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-xs">{selectedContact.message}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateContactStatus(selectedContact.id, 'in_progress');
                      setSelectedContact({ ...selectedContact, status: 'in_progress' });
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => {
                      updateContactStatus(selectedContact.id, 'resolved');
                      setSelectedContact(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    Mark Resolved
                  </button>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. NOTIFICATIONS VIEW
  // -------------------------------------------------------------
  if (activeSection === 'notifications') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Notification Centre
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              System alerts, new listings approvals, fraud escalations, and payment transaction updates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              Mark All Read
            </button>
            <button
              onClick={clearNotifications}
              className="px-3.5 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                n.read ? 'bg-white border-slate-200/80' : 'bg-blue-50/40 border-blue-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.read ? 'bg-slate-100 text-slate-500' : 'bg-[#77101F] text-white'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap pl-4">
                {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'Just now'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. TESTIMONIALS VIEW
  // -------------------------------------------------------------
  if (activeSection === 'testimonials') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Customer Testimonials
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Buyer and seller verified reviews showcased on the public landing page.
            </p>
          </div>
          <button
            onClick={() => setTestimonialModalOpen(true)}
            className="px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17] shadow-2xs"
          >
            Add Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic">"{t.quote}"</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.designation || 'Owner'} • {t.location}</div>
                </div>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {testimonialModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Add Verified Review</h3>
                <button onClick={() => setTestimonialModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                addTestimonial({
                  name: testName,
                  quote: testQuote,
                  vehiclePurchased: testVehicle,
                  rating: testRating,
                  status: 'Active'
                });
                setTestimonialModalOpen(false);
              }} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Review Quote</label>
                  <textarea
                    rows={3}
                    value={testQuote}
                    onChange={(e) => setTestQuote(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTestimonialModalOpen(false)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#77101F] text-white font-bold rounded-xl"
                  >
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. AUDIT LOGS VIEW
  // -------------------------------------------------------------
  if (activeSection === 'audit') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Platform Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Append-only security log tracking administrator logins, status modifications, and KYC updates.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {auditLogs.length} Logged Entries
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Previous Value</th>
                <th className="py-3 px-4">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{String(l.timestamp || '').replace('T', ' ').slice(0, 19)}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">{l.adminName}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{l.module}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#77101F]">{l.action}</td>
                  <td className="py-3 px-4 text-slate-500">{l.recordId}</td>
                  <td className="py-3 px-4 text-slate-400 truncate max-w-[120px]">{l.oldValue || '—'}</td>
                  <td className="py-3 px-4 text-emerald-700 truncate max-w-[120px]">{l.newValue || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. SETTINGS VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Platform Configuration & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global marketplace settings, financial tax percentages, contact details, and SEO metadata.
          </p>
        </div>
        <button
          disabled={isSavingGlobalSettings}
          onClick={async () => {
            setIsSavingGlobalSettings(true);
            try {
              const currentPayload = { ...formSettings };

              // 1. Process any pending local preview file uploads to permanent server storage
              const pendingKeys = Object.keys(pendingFiles) as Array<'websiteLogo' | 'mobileLogo' | 'adminLogo' | 'favicon'>;
              for (const key of pendingKeys) {
                const item = pendingFiles[key];
                if (item) {
                  const type = key === 'favicon' ? 'favicon' : key === 'mobileLogo' ? 'mobile_logo' : key === 'adminLogo' ? 'admin_logo' : 'logo';
                  const reader = new FileReader();
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(item.file);
                  });

                  const res = await fetch('/api/admin/branding/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      dataUrl,
                      filename: item.file.name,
                      type
                    })
                  });

                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || `Failed to permanently upload ${item.file.name}`);
                  }

                  const uploadRes = await res.json();
                  const permanentUrl = uploadRes.url;
                  currentPayload[key] = permanentUrl;
                  if (key === 'websiteLogo') currentPayload.logoUrl = permanentUrl;
                  if (key === 'favicon') currentPayload.faviconUrl = permanentUrl;

                  URL.revokeObjectURL(item.previewUrl);
                }
              }

              setPendingFiles({});
              setFormSettings(currentPayload);

              // 2. Persist to authoritative global database setting & broadcast to all browsers
              const saved = await updateSettings(currentPayload);
              if (saved) {
                showToast('Settings Saved', 'Platform branding and settings published globally to all browsers.', 'success');
              }
            } catch (err: any) {
              console.error('[Settings] Global save error:', err);
              showToast('Save Failed', `Could not update settings: ${err.message || 'Unknown error'}`, 'error');
            } finally {
              setIsSavingGlobalSettings(false);
            }
          }}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17] shadow-2xs disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSavingGlobalSettings ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Subtab Navigation (Requirement 19) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setSettingsSubTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            settingsSubTab === 'general'
              ? 'bg-[#77101F] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>General & Branding</span>
        </button>
        <button
          type="button"
          onClick={() => setSettingsSubTab('fields')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            settingsSubTab === 'fields'
              ? 'bg-[#77101F] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Vehicle Fields & Specification Rules</span>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 ml-1">
            Rules
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSettingsSubTab('secrets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            settingsSubTab === 'secrets'
              ? 'bg-[#77101F] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys & Secret Gateways</span>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 ml-1">
            9 Secrets
          </span>
        </button>
      </div>

      {/* ====================================================
          REQUIREMENT 19: VEHICLE FIELDS CONFIGURATION VIEW
          Configure whether fields are Required, Optional, Hidden
          by vehicle category where business rules permit.
      ==================================================== */}
      {settingsSubTab === 'fields' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#77101F]" />
                <span>Category Field Rules Configuration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set Required, Optional, or Hidden rules for vehicle specifications per category. Existing listings remain preserved safely.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Safe Schema Mode Active
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Select Vehicle Category
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Cars', 'Bikes & Scooters', 'Trucks & Lorries', 'Buses', 'Tractors & Backhoe Loaders', 'Heavy Machinery Vehicles'] as VehicleCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFieldsCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedFieldsCategory === cat
                      ? 'bg-[#77101F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fields Matrix for Selected Category */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Field Name</th>
                  <th className="py-3 px-4">Category Relevance</th>
                  <th className="py-3 px-4 text-center">Status / Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: 'spareKey', label: 'Spare Key Available', group: 'Condition (All Categories)' },
                  { key: 'insuranceValidity', label: 'Insurance Validity Date', group: 'Condition (All Categories)' },
                  { key: 'hypothecationStatus', label: 'Hypothecation / Loan Status', group: 'Condition (All Categories)' },
                  { key: 'oemService', label: 'OEM Service History & Documents', group: 'Condition (All Categories)' },
                  { key: 'engineWarranty', label: 'Engine Warranty Status & Date', group: 'Condition (All Categories)' },
                  { key: 'majorAccident', label: 'Major Accident History & Notes', group: 'Condition (All Categories)' },
                  { key: 'loadCapacity', label: 'Load Capacity (Payload)', group: 'Commercial / Machinery' },
                  { key: 'bucketCapacity', label: 'Bucket Capacity (Volume)', group: 'Commercial / Machinery' },
                  { key: 'maxOperatingWeight', label: 'Maximum Operating Weight (GVW)', group: 'Commercial / Machinery' },
                  { key: 'maxHeightCapacity', label: 'Maximum Height Capacity', group: 'Commercial / Machinery' },
                  { key: 'maxLiftCapacity', label: 'Maximum Lift Capacity', group: 'Commercial / Machinery' },
                  { key: 'maximumDiggingPower', label: 'Maximum Digging Power', group: 'Heavy Machinery Only' },
                  { key: 'enginePower', label: 'Engine Power Rating', group: 'Heavy Machinery Only' }
                ].map(field => {
                  const currentRule: CategoryFieldRule = 
                    formSettings.vehicleFieldsConfig?.[selectedFieldsCategory]?.[field.key as keyof typeof formSettings.vehicleFieldsConfig[typeof selectedFieldsCategory]] || 
                    (field.group.includes('All Categories') ? 'Required' : 'Optional');

                  return (
                    <tr key={field.key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{field.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{field.key}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {field.group}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(['Required', 'Optional', 'Hidden'] as CategoryFieldRule[]).map(rule => (
                            <button
                              key={rule}
                              type="button"
                              onClick={() => {
                                const cfg = formSettings.vehicleFieldsConfig || {};
                                const catCfg = cfg[selectedFieldsCategory] || {} as any;
                                setFormSettings({
                                  ...formSettings,
                                  vehicleFieldsConfig: {
                                    ...cfg,
                                    [selectedFieldsCategory]: {
                                      ...catCfg,
                                      [field.key]: rule
                                    }
                                  }
                                });
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentRule === rule
                                  ? rule === 'Required'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : rule === 'Optional'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-slate-200 text-slate-800 border border-slate-300'
                                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {rule}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Click &quot;Save Changes&quot; in the header bar to persist updated rules to all sellers.
            </span>
            <button
              type="button"
              onClick={() => {
                updateSettings(formSettings);
                showToast('Rules Saved', `Vehicle fields configuration updated for ${selectedFieldsCategory}.`, 'success');
              }}
              className="px-4 py-2 bg-[#77101F] text-white font-bold rounded-xl hover:bg-[#5E0B17] flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Rules</span>
            </button>
          </div>
        </div>
      ) : settingsSubTab === 'secrets' ? (
        <SecretsConfigTab />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Requirement 18: Admin & Marketplace Branding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Marketplace & Admin Branding</h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#77101F] bg-[#77101F]/10 px-2 py-0.5 rounded-full">
                  Central Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official canonical OnRoadPriz branding distributed across all browsers, dashboards, headers, footers, and browser tab favicons.
              </p>
            </div>
            
            {/* Header Action Buttons: Preview, Reset, Save Changes */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBrandingPreviewModal(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Preview branding across Desktop, Mobile, Admin, and Footer"
              >
                <Eye className="w-3.5 h-3.5 text-[#77101F]" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={handleResetToOfficialBranding}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Reset all fields to official OnRoadPriz logo and favicon"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                disabled={isSavingGlobalSettings}
                onClick={async () => {
                  setIsSavingGlobalSettings(true);
                  try {
                    const currentPayload = { ...formSettings };
                    const pendingKeys = Object.keys(pendingFiles) as Array<'websiteLogo' | 'mobileLogo' | 'adminLogo' | 'favicon'>;
                    for (const key of pendingKeys) {
                      const item = pendingFiles[key];
                      if (item) {
                        const type = key === 'favicon' ? 'favicon' : key === 'mobileLogo' ? 'mobile_logo' : key === 'adminLogo' ? 'admin_logo' : 'logo';
                        const reader = new FileReader();
                        const dataUrl = await new Promise<string>((resolve, reject) => {
                          reader.onload = () => resolve(reader.result as string);
                          reader.onerror = reject;
                          reader.readAsDataURL(item.file);
                        });

                        const res = await fetch('/api/admin/branding/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dataUrl, filename: item.file.name, type })
                        });

                        if (res.ok) {
                          const uploadRes = await res.json();
                          currentPayload[key] = uploadRes.url;
                          if (key === 'websiteLogo') currentPayload.logoUrl = uploadRes.url;
                          if (key === 'favicon') currentPayload.faviconUrl = uploadRes.url;
                        }
                        URL.revokeObjectURL(item.previewUrl);
                      }
                    }

                    setPendingFiles({});
                    setFormSettings(currentPayload);
                    const saved = await updateSettings(currentPayload);
                    if (saved) {
                      showToast('Branding Published', 'Brand assets saved and broadcast to all browsers and devices globally.', 'success');
                    }
                  } catch (err: any) {
                    showToast('Save Failed', err.message || 'Error updating branding', 'error');
                  } finally {
                    setIsSavingGlobalSettings(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingGlobalSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Website Logo (Desktop Header, Login, Signup) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Website Logo (Desktop)</label>
                  {pendingFiles.websiteLogo ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Preview</span>
                  ) : formSettings.websiteLogo ? (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">v{formSettings.logoVersion || 1} Global</span>
                  ) : null}
                </div>

                <div className="mt-2">
                  {pendingFiles.websiteLogo ? (
                    <div className="relative bg-amber-50/50 p-2 rounded-lg border border-amber-300 flex flex-col items-center justify-center min-h-[80px] gap-2">
                      <img src={pendingFiles.websiteLogo.previewUrl} alt="Pending Preview" className="max-h-14 w-auto object-contain" />
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploadingBranding.websiteLogo}
                          onClick={() => handleUploadAndSaveAsset('websiteLogo', 'logo')}
                          className="flex-1 py-1 px-2 bg-[#77101F] text-white text-[10px] font-bold rounded hover:bg-[#5E0B17] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          {isUploadingBranding.websiteLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          <span>Publish Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardPending('websiteLogo')}
                          className="py-1 px-2 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : formSettings.websiteLogo ? (
                    <div className="relative bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center h-20 group">
                      <img 
                        src={getVersionedAssetUrl(formSettings.websiteLogo, formSettings.logoVersion || 1)} 
                        alt="Website Logo" 
                        className="max-h-16 w-auto object-contain" 
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="p-1 bg-slate-800 text-white rounded text-[10px] hover:bg-slate-900 cursor-pointer">
                          Edit
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSelectFile('websiteLogo', file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormSettings({ 
                            ...formSettings, 
                            websiteLogo: CANONICAL_BRAND_LOGO, 
                            logoUrl: CANONICAL_BRAND_LOGO,
                            logo_url: CANONICAL_BRAND_LOGO 
                          })}
                          className="p-1 bg-slate-700 text-white rounded text-[10px] hover:bg-slate-800 cursor-pointer"
                          title="Restore Master OnRoadPriz Logo"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                      <span className="text-[11px] text-slate-500 block">Default Brand Mark</span>
                      <label className="text-[11px] text-[#77101F] font-bold hover:underline cursor-pointer mt-1 inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Select File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSelectFile('websiteLogo', file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Or paste permanent URL"
                value={formSettings.websiteLogo || ''}
                onChange={(e) => setFormSettings({ ...formSettings, websiteLogo: e.target.value, logoUrl: e.target.value })}
                className="w-full p-2 text-[11px] border border-slate-200 rounded-lg bg-white"
              />
            </div>

            {/* 2. Mobile Logo (Mobile Drawer & Mobile Navigation) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Mobile Header Logo</label>
                  {pendingFiles.mobileLogo ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Preview</span>
                  ) : formSettings.mobileLogo ? (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">v{formSettings.mobileLogoVersion || 1} Global</span>
                  ) : null}
                </div>

                <div className="mt-2">
                  {pendingFiles.mobileLogo ? (
                    <div className="relative bg-amber-50/50 p-2 rounded-lg border border-amber-300 flex flex-col items-center justify-center min-h-[80px] gap-2">
                      <img src={pendingFiles.mobileLogo.previewUrl} alt="Pending Preview" className="max-h-14 w-auto object-contain" />
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploadingBranding.mobileLogo}
                          onClick={() => handleUploadAndSaveAsset('mobileLogo', 'mobile_logo')}
                          className="flex-1 py-1 px-2 bg-[#77101F] text-white text-[10px] font-bold rounded hover:bg-[#5E0B17] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          {isUploadingBranding.mobileLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          <span>Publish Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardPending('mobileLogo')}
                          className="py-1 px-2 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : formSettings.mobileLogo ? (
                    <div className="relative bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center h-20 group">
                      <img 
                        src={getVersionedAssetUrl(formSettings.mobileLogo, formSettings.mobileLogoVersion || 1)} 
                        alt="Mobile Logo" 
                        className="max-h-16 w-auto object-contain" 
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="p-1 bg-slate-800 text-white rounded text-[10px] hover:bg-slate-900 cursor-pointer">
                          Edit
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSelectFile('mobileLogo', file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormSettings({ ...formSettings, mobileLogo: '' })}
                          className="p-1 bg-red-600 text-white rounded text-[10px] hover:bg-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                      <span className="text-[11px] text-slate-500 block">Uses Website Logo</span>
                      <label className="text-[11px] text-[#77101F] font-bold hover:underline cursor-pointer mt-1 inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Select File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSelectFile('mobileLogo', file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Or paste permanent URL"
                value={formSettings.mobileLogo || ''}
                onChange={(e) => setFormSettings({ ...formSettings, mobileLogo: e.target.value })}
                className="w-full p-2 text-[11px] border border-slate-200 rounded-lg bg-white"
              />
            </div>

            {/* 3. Admin Portal Logo (Header, Sidebar, Staff Login) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Admin Portal Logo</label>
                  {pendingFiles.adminLogo ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Preview</span>
                  ) : formSettings.adminLogo ? (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">v{formSettings.adminLogoVersion || 1} Global</span>
                  ) : null}
                </div>

                <div className="mt-2">
                  {pendingFiles.adminLogo ? (
                    <div className="relative bg-amber-50/50 p-2 rounded-lg border border-amber-300 flex flex-col items-center justify-center min-h-[80px] gap-2">
                      <img src={pendingFiles.adminLogo.previewUrl} alt="Pending Preview" className="max-h-14 w-auto object-contain" />
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploadingBranding.adminLogo}
                          onClick={() => handleUploadAndSaveAsset('adminLogo', 'admin_logo')}
                          className="flex-1 py-1 px-2 bg-[#77101F] text-white text-[10px] font-bold rounded hover:bg-[#5E0B17] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          {isUploadingBranding.adminLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          <span>Publish Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardPending('adminLogo')}
                          className="py-1 px-2 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : formSettings.adminLogo ? (
                    <div className="relative bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center h-20 group">
                      <img 
                        src={getVersionedAssetUrl(formSettings.adminLogo, formSettings.adminLogoVersion || 1)} 
                        alt="Admin Logo" 
                        className="max-h-16 w-auto object-contain" 
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="p-1 bg-slate-800 text-white rounded text-[10px] hover:bg-slate-900 cursor-pointer">
                          Edit
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSelectFile('adminLogo', file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormSettings({ ...formSettings, adminLogo: '' })}
                          className="p-1 bg-red-600 text-white rounded text-[10px] hover:bg-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                      <span className="text-[11px] text-slate-500 block">Fallback to Site Logo</span>
                      <label className="text-[11px] text-[#77101F] font-bold hover:underline cursor-pointer mt-1 inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Select File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSelectFile('adminLogo', file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Or paste permanent URL"
                value={formSettings.adminLogo || ''}
                onChange={(e) => setFormSettings({ ...formSettings, adminLogo: e.target.value })}
                className="w-full p-2 text-[11px] border border-slate-200 rounded-lg bg-white"
              />
            </div>

            {/* 4. Browser Favicon (.ico / .svg / .png) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Browser Favicon</label>
                  {pendingFiles.favicon ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Preview</span>
                  ) : formSettings.favicon ? (
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">v{formSettings.faviconVersion || 1} Global</span>
                  ) : null}
                </div>

                <div className="mt-2">
                  {pendingFiles.favicon ? (
                    <div className="relative bg-amber-50/50 p-2 rounded-lg border border-amber-300 flex flex-col items-center justify-center min-h-[80px] gap-2">
                      <img src={pendingFiles.favicon.previewUrl} alt="Pending Favicon" className="w-8 h-8 object-contain" />
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploadingBranding.favicon}
                          onClick={() => handleUploadAndSaveAsset('favicon', 'favicon')}
                          className="flex-1 py-1 px-2 bg-[#77101F] text-white text-[10px] font-bold rounded hover:bg-[#5E0B17] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          {isUploadingBranding.favicon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          <span>Publish Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardPending('favicon')}
                          className="py-1 px-2 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : formSettings.favicon ? (
                    <div className="relative bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center h-20 group">
                      <img 
                        src={getVersionedAssetUrl(formSettings.favicon, formSettings.faviconVersion || 1)} 
                        alt="Favicon" 
                        className="w-8 h-8 object-contain" 
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="p-1 bg-slate-800 text-white rounded text-[10px] hover:bg-slate-900 cursor-pointer">
                          Edit
                          <input
                            type="file"
                            accept="image/*,.ico"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSelectFile('favicon', file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormSettings({ 
                            ...formSettings, 
                            favicon: '/favicon.svg', 
                            faviconUrl: '/favicon.svg',
                            favicon_url: '/favicon.svg' 
                          })}
                          className="p-1 bg-slate-700 text-white rounded text-[10px] hover:bg-slate-800 cursor-pointer"
                          title="Restore Default Favicon"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                      <span className="text-[11px] text-slate-500 block">Default Favicon</span>
                      <label className="text-[11px] text-[#77101F] font-bold hover:underline cursor-pointer mt-1 inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Select File</span>
                        <input
                          type="file"
                          accept="image/*,.ico"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSelectFile('favicon', file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Or paste permanent URL"
                value={formSettings.favicon || ''}
                onChange={(e) => setFormSettings({ ...formSettings, favicon: e.target.value, faviconUrl: e.target.value })}
                className="w-full p-2 text-[11px] border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* General & Help Center Contact Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform & Help Center Contact Details</h3>
              <p className="text-[11px] text-slate-500">Updates here automatically sync to the public Help Center page.</p>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={formSettings.siteName}
              onChange={(e) => setFormSettings({ ...formSettings, siteName: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Helpline Phone</label>
              <input
                type="tel"
                value={formSettings.supportPhone}
                onChange={(e) => setFormSettings({ ...formSettings, supportPhone: e.target.value })}
                placeholder="+91 891 278 4590"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email Address</label>
              <input
                type="email"
                value={formSettings.supportEmail}
                onChange={(e) => setFormSettings({ ...formSettings, supportEmail: e.target.value })}
                placeholder="support@onroadpriz.com"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Center Title</label>
              <input
                type="text"
                value={formSettings.headquartersTitle ?? 'Operational Center'}
                onChange={(e) => setFormSettings({ ...formSettings, headquartersTitle: e.target.value })}
                placeholder="Operational Center"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Working Hours</label>
              <input
                type="text"
                value={formSettings.supportHours ?? 'Monday – Saturday, 9:00 AM – 8:00 PM IST'}
                onChange={(e) => setFormSettings({ ...formSettings, supportHours: e.target.value })}
                placeholder="Monday – Saturday, 9:00 AM – 8:00 PM IST"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Operational Center / Corporate Address</label>
            <textarea
              rows={2}
              value={formSettings.headquartersAddress}
              onChange={(e) => setFormSettings({ ...formSettings, headquartersAddress: e.target.value })}
              placeholder="OnRoadPriz Towers, VIP Road, Siripuram, Visakhapatnam, AP 530003"
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isSavingGlobalSettings}
              onClick={async () => {
                setIsSavingGlobalSettings(true);
                try {
                  await updateSettings(formSettings);
                } finally {
                  setIsSavingGlobalSettings(false);
                }
              }}
              className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {isSavingGlobalSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Contact Details</span>
            </button>
          </div>
        </div>

        {/* Finance & Taxation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Finance & GST Configuration</h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={formSettings.gstRatePercent}
                onChange={(e) => setFormSettings({ ...formSettings, gstRatePercent: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Code & Symbol</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formSettings.currencyCode}
                  onChange={(e) => setFormSettings({ ...formSettings, currencyCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  value={formSettings.currencySymbol}
                  onChange={(e) => setFormSettings({ ...formSettings, currencySymbol: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isSavingGlobalSettings}
              onClick={async () => {
                setIsSavingGlobalSettings(true);
                try {
                  await updateSettings(formSettings);
                } finally {
                  setIsSavingGlobalSettings(false);
                }
              }}
              className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {isSavingGlobalSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Finance Settings</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Global Branding Preview Modal */}
      {showBrandingPreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg font-display flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#77101F]" />
                  <span>OnRoadPriz Branding Live Preview</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Responsive preview of the official master logo across all platform touchpoints.
                </p>
              </div>
              <button
                onClick={() => setShowBrandingPreviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              {/* 1. Desktop Website Header Mockup */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Desktop Website Header
                </span>
                <div className="p-4 bg-white border border-[#DCE3EC] rounded-2xl flex items-center justify-between shadow-xs">
                  <BrandLogo variant="header" />
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <span className="px-3 py-1.5 bg-[#F7F9FC] border border-[#DCE3EC] rounded-full text-[11px]">
                      📍 Visakhapatnam
                    </span>
                    <span className="text-[#77101F]">Buy Vehicles</span>
                    <span className="bg-[#77101F] text-white px-3 py-1 rounded-xl">Sell Vehicle</span>
                  </div>
                </div>
              </div>

              {/* 2. Mobile Viewport Mockup */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  2. Mobile Viewport Navigation (34–40px, non-overlapping)
                </span>
                <div className="max-w-sm p-3 bg-white border border-[#DCE3EC] rounded-2xl flex items-center justify-between shadow-xs">
                  <BrandLogo variant="mobile" />
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="p-1.5 bg-slate-100 rounded-lg text-xs font-bold text-[#77101F]">Post Ad</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold">☰</div>
                  </div>
                </div>
              </div>

              {/* 3. Admin Header & Sidebar Mockup */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  3. Admin Enterprise Portal
                </span>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <BrandLogo variant="admin" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                      STAFF ADMIN
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Footer Card Mockup */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  4. Website Footer (Clean Container, No Filter Alteration)
                </span>
                <div className="p-5 bg-slate-900 rounded-2xl flex items-center justify-between">
                  <div className="inline-flex items-center p-2 rounded-xl bg-white shadow-xs">
                    <BrandLogo variant="footer" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">0% Brokerage Marketplace</span>
                </div>
              </div>

              {/* 5. Browser Tab Favicon Mockup */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  5. Browser Tab Favicon
                </span>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 max-w-sm">
                  <img 
                    src={getVersionedAssetUrl(formSettings.favicon || '/favicon.svg', formSettings.faviconVersion || 1)} 
                    alt="Favicon preview" 
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    OnRoadPriz — India's Trusted Vehicle Resale Marketplace
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBrandingPreviewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
