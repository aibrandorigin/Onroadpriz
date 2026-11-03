import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Lock, 
  Server, 
  Info,
  Radio,
  FileCode2,
  Terminal,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export interface SecretFieldMeta {
  key: string;
  label: string;
  description: string;
  category: 'gemini' | 'sms';
  isSecret: boolean;
  isConfigured: boolean;
  source: 'environment' | 'database' | 'default' | 'missing';
  maskedValue: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export const SecretsConfigTab: React.FC = () => {
  const { showToast } = useApp();

  // State
  const [fields, setFields] = useState<SecretFieldMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'missing' | 'configured'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form input values (empty string means "preserve existing")
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});
  // Field visibility toggles for password inputs (show/hide)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  // Copied indicator per key
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Revealed plain values cache (fetched on explicit admin reveal)
  const [revealedPlain, setRevealedPlain] = useState<Record<string, string>>({});

  // Gemini test state
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success: boolean;
    configured?: boolean;
    latencyMs?: number;
    sampleResponse?: string;
    error?: string;
    timestamp?: string;
  } | null>(null);

  // SMS test state
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [smsTestMode, setSmsTestMode] = useState<'dry-run' | 'live'>('dry-run');
  const [testMobileInput, setTestMobileInput] = useState('');
  const [smsTestResult, setSmsTestResult] = useState<{
    success: boolean;
    mode: string;
    message: string;
    latencyMs?: number;
    details?: any;
    error?: string;
  } | null>(null);

  // Auth token helper
  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('onroadpriz_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Load configuration metadata from server
  const fetchSecretsConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/secrets-config', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Access denied. Administrator session required.');
        }
        throw new Error('Failed to load server secret configurations.');
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.fields)) {
        setFields(data.fields);
      }
    } catch (err: any) {
      console.error('[SecretsConfig] Error loading:', err);
      showToast('Config Load Error', err.message || 'Could not load secrets configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSecretsConfig();
  }, [fetchSecretsConfig]);

  // Handle Copy
  const handleCopy = async (key: string, maskedValue: string) => {
    try {
      // If user typed a new value in form, copy that
      if (formInputs[key]?.trim()) {
        await navigator.clipboard.writeText(formInputs[key].trim());
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        showToast('Copied', `Copied new ${key} value to clipboard.`, 'info');
        return;
      }

      // If already revealed plain value, copy that
      if (revealedPlain[key]) {
        await navigator.clipboard.writeText(revealedPlain[key]);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        showToast('Copied', `Copied configured ${key} to clipboard.`, 'info');
        return;
      }

      // Otherwise fetch revealed plain value from authorized endpoint
      const res = await fetch('/api/admin/secrets-config/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ key })
      });

      if (!res.ok) {
        throw new Error('Could not retrieve secret value.');
      }

      const json = await res.json();
      if (json.value) {
        setRevealedPlain(prev => ({ ...prev, [key]: json.value }));
        await navigator.clipboard.writeText(json.value);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        showToast('Copied', `Copied configured ${key} to clipboard.`, 'info');
      } else {
        showToast('No Value', `${key} is currently empty.`, 'warning');
      }
    } catch (err: any) {
      showToast('Copy Failed', err.message || 'Could not copy to clipboard', 'error');
    }
  };

  // Toggle Reveal / Show plain text
  const handleToggleReveal = async (key: string) => {
    const isCurrentlyShown = showValues[key];

    // If currently showing, just hide
    if (isCurrentlyShown) {
      setShowValues(prev => ({ ...prev, [key]: false }));
      return;
    }

    // If already typed or previously revealed, just toggle to show
    if (formInputs[key] || revealedPlain[key]) {
      setShowValues(prev => ({ ...prev, [key]: true }));
      return;
    }

    // Otherwise fetch from authorized endpoint
    try {
      const res = await fetch('/api/admin/secrets-config/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ key })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.value) {
          setRevealedPlain(prev => ({ ...prev, [key]: json.value }));
        }
      }
    } catch {
      // Fallback
    }

    setShowValues(prev => ({ ...prev, [key]: true }));
  };

  // Save changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Validate inputs before saving
      const changedKeys = Object.keys(formInputs).filter(k => formInputs[k]?.trim() !== '');

      if (changedKeys.length === 0) {
        showToast('No Changes', 'No configuration fields were modified.', 'info');
        setIsSaving(false);
        return;
      }

      // Client-side validations
      if (formInputs['SMS_BASE_URL']?.trim()) {
        try {
          const u = new URL(formInputs['SMS_BASE_URL'].trim());
          if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            throw new Error();
          }
        } catch {
          throw new Error('SMS_BASE_URL must be a valid HTTP/HTTPS URL (e.g. https://ultronsms.com/api/mt/SendSMS).');
        }
      }

      if (formInputs['SMS_PE_ID']?.trim() && !/^\d+$/.test(formInputs['SMS_PE_ID'].trim())) {
        throw new Error('SMS_PE_ID must contain numeric digits only.');
      }

      if (formInputs['SMS_DLT_TEMPLATE_ID']?.trim() && !/^\d+$/.test(formInputs['SMS_DLT_TEMPLATE_ID'].trim())) {
        throw new Error('SMS_DLT_TEMPLATE_ID must contain numeric digits only.');
      }

      const res = await fetch('/api/admin/secrets-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          secrets: formInputs
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration settings.');
      }

      showToast('Settings Saved', data.message || 'All configuration keys updated securely.', 'success');

      // Clear input overrides since they are now saved on server
      setFormInputs({});
      setRevealedPlain({});
      if (Array.isArray(data.fields)) {
        setFields(data.fields);
      } else {
        await fetchSecretsConfig();
      }
    } catch (err: any) {
      console.error('[SecretsConfig] Save error:', err);
      showToast('Save Failed', err.message || 'Error updating secret keys', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Gemini Connection
  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await fetch('/api/admin/integrations/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      const data = await res.json();
      setGeminiTestResult(data);
      if (data.success) {
        showToast('Gemini Connected', `Successfully pinged gemini-3.8-flash in ${data.latencyMs}ms.`, 'success');
      } else {
        showToast('Gemini Test Warning', data.error || 'Connection failed', 'warning');
      }
    } catch (err: any) {
      const fail = { success: false, error: err.message || 'Network error testing Gemini API' };
      setGeminiTestResult(fail);
      showToast('Test Failed', fail.error, 'error');
    } finally {
      setIsTestingGemini(false);
    }
  };

  // Test SMS Gateway
  const handleTestSms = async () => {
    setIsTestingSms(true);
    setSmsTestResult(null);
    try {
      if (smsTestMode === 'live' && !testMobileInput.trim()) {
        throw new Error('Please enter a 10-digit Indian mobile number for live test dispatch.');
      }

      const res = await fetch('/api/admin/integrations/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          sendRealSms: smsTestMode === 'live',
          testMobile: testMobileInput.trim()
        })
      });

      const data = await res.json();
      setSmsTestResult(data);
      if (data.success) {
        showToast('SMS Gateway Verified', data.message, 'success');
      } else {
        showToast('SMS Gateway Warning', data.message || data.error || 'Verification issue', 'warning');
      }
    } catch (err: any) {
      const fail = {
        success: false,
        mode: smsTestMode,
        message: err.message || 'Failed to communicate with SMS service',
        error: err.message
      };
      setSmsTestResult(fail);
      showToast('SMS Test Failed', fail.message, 'error');
    } finally {
      setIsTestingSms(false);
    }
  };

  // Stats
  const totalCount = fields.length;
  const configuredCount = fields.filter(f => f.isConfigured).length;
  const missingCount = fields.filter(f => !f.isConfigured).length;

  const filteredFields = fields.filter(f => {
    if (filterMode === 'configured' && !f.isConfigured) return false;
    if (filterMode === 'missing' && f.isConfigured) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.key.toLowerCase().includes(q) || f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  const geminiFields = filteredFields.filter(f => f.category === 'gemini');
  const smsFields = filteredFields.filter(f => f.category === 'sms');

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#77101F]/10 rounded-xl text-[#77101F]">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                API Keys & Secret Gateways Configuration
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Manage all 9 mission-critical environment variables and provider secrets. Credentials are stored securely on the server and masked by default.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchSecretsConfig}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh configuration status from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Secrets...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Required</span>
              <span className="text-xl font-black text-slate-900 font-mono">9 Fields</span>
            </div>
            <Server className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Configured</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{configuredCount} / 9</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Missing</span>
              <span className="text-xl font-black text-amber-700 font-mono">{missingCount} / 9</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Protection</span>
              <span className="text-xs font-bold text-blue-700">Masked Server Storage</span>
            </div>
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All (9)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('configured')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'configured'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Configured ({configuredCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('missing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'missing'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Missing ({missingCount})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search key name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#77101F]"
            />
          </div>
        </div>
      </div>

      {/* ====================================================
          SECTION 1: GEMINI AI CONFIGURATION
      ==================================================== */}
      {(geminiFields.length > 0 || filterMode === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <span>Google Gemini AI Engine</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                    gemini-3.8-flash
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Powering intelligent vehicle listings, market price analysis, and appraisal descriptions.
                </p>
              </div>
            </div>

            {/* Test Gemini Button */}
            <button
              type="button"
              onClick={handleTestGemini}
              disabled={isTestingGemini}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTestingGemini ? 'animate-spin' : ''}`} />
              <span>{isTestingGemini ? 'Testing Gemini AI...' : 'Test Gemini Connection'}</span>
            </button>
          </div>

          {/* Gemini Test Feedback Card */}
          {geminiTestResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              geminiTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  {geminiTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  <span>{geminiTestResult.success ? 'Gemini API Connected Successfully' : 'Gemini Connectivity Issue'}</span>
                </div>
                {geminiTestResult.latencyMs !== undefined && (
                  <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded border border-current">
                    Latency: {geminiTestResult.latencyMs}ms
                  </span>
                )}
              </div>
              {geminiTestResult.sampleResponse && (
                <div className="mt-1 p-2 bg-white/90 rounded border border-emerald-200 text-slate-800 font-mono text-[11px]">
                  <strong>AI Response:</strong> "{geminiTestResult.sampleResponse}"
                </div>
              )}
              {geminiTestResult.error && (
                <p className="mt-1 text-red-700">{geminiTestResult.error}</p>
              )}
            </div>
          )}

          {/* Gemini Field Row */}
          {geminiFields.map(field => (
            <div key={field.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">{field.key}</span>
                    {field.isConfigured ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3" /> Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Missing
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Source: {field.source}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{field.description}</p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(field.key)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title={showValues[field.key] ? 'Hide Key' : 'Reveal Key'}
                  >
                    {showValues[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showValues[field.key] ? 'Hide' : 'Reveal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(field.key, field.maskedValue)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Copy Key to Clipboard"
                  >
                    {copiedKey === field.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === field.key ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showValues[field.key] ? 'text' : 'password'}
                  placeholder={
                    field.isConfigured
                      ? `(Current: ${field.maskedValue}) — Enter new key to update, or leave blank to keep existing`
                      : 'Enter GEMINI_API_KEY...'
                  }
                  value={formInputs[field.key] ?? (showValues[field.key] && revealedPlain[field.key] ? revealedPlain[field.key] : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormInputs(prev => ({ ...prev, [field.key]: val }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Leave blank to preserve current configured secret.</span>
                {field.lastUpdated && (
                  <span>Last updated: {new Date(field.lastUpdated).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================
          SECTION 2: ULTRON SMS DLT GATEWAY CONFIGURATION
      ==================================================== */}
      {(smsFields.length > 0 || filterMode === 'all') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <span>Ultron SMS DLT Gateway</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                    8 Fields
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  DLT-compliant Indian telecom transactional gateway for instant OTP dispatches and price alert notifications.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                DLT Headers & Routes
              </span>
            </div>
          </div>

          {/* SMS Testing Tool Card */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>SMS Gateway Testing Tool (Admin Only)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Safely test connectivity without sending unsolicited messages, or authorize a live test OTP.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSmsTestMode('dry-run')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    smsTestMode === 'dry-run'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dry-Run (Safe Check)
                </button>
                <button
                  type="button"
                  onClick={() => setSmsTestMode('live')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    smsTestMode === 'live'
                      ? 'bg-[#77101F] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Live Test Dispatch
                </button>
              </div>
            </div>

            {/* Test Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {smsTestMode === 'live' && (
                <div className="w-full sm:w-64">
                  <input
                    type="tel"
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    value={testMobileInput}
                    onChange={(e) => setTestMobileInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleTestSms}
                disabled={isTestingSms}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isTestingSms ? 'animate-spin' : ''}`} />
                <span>
                  {isTestingSms
                    ? 'Running SMS Test...'
                    : smsTestMode === 'dry-run'
                    ? 'Run Safe Connectivity Check (No SMS)'
                    : 'Authorize & Send 1 Test SMS'}
                </span>
              </button>
            </div>

            {/* SMS Test Result Output */}
            {smsTestResult && (
              <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                smsTestResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    {smsTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    <span>{smsTestResult.message}</span>
                  </div>
                  {smsTestResult.latencyMs !== undefined && (
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-current">
                      {smsTestResult.latencyMs}ms
                    </span>
                  )}
                </div>
                {smsTestResult.details && (
                  <pre className="mt-1 p-2 bg-white/90 rounded border border-slate-200 text-[10px] font-mono text-slate-700 overflow-x-auto">
                    {JSON.stringify(smsTestResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* 8 SMS Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smsFields.map(field => {
              const isSecretField = field.isSecret;
              const currentValue = formInputs[field.key] ?? (
                showValues[field.key] && revealedPlain[field.key]
                  ? revealedPlain[field.key]
                  : (!isSecretField && revealedPlain[field.key] ? revealedPlain[field.key] : '')
              );

              return (
                <div key={field.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-slate-900">{field.key}</span>
                        {field.isConfigured ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Configured
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Missing
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isSecretField && (
                          <button
                            type="button"
                            onClick={() => handleToggleReveal(field.key)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                            title={showValues[field.key] ? 'Hide' : 'Reveal'}
                          >
                            {showValues[field.key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(field.key, field.maskedValue)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Copy"
                        >
                          {copiedKey === field.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">{field.label}</p>
                  </div>

                  {/* Input field */}
                  <div className="space-y-1">
                    <input
                      type={isSecretField && !showValues[field.key] ? 'password' : 'text'}
                      placeholder={
                        field.isConfigured
                          ? `(Saved: ${field.maskedValue})`
                          : `Enter ${field.key}...`
                      }
                      value={currentValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormInputs(prev => ({ ...prev, [field.key]: val }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#77101F]"
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {field.source}</span>
                      <span>{field.isConfigured ? 'Keep blank to preserve' : 'Required'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Bottom Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#77101F] shrink-0" />
          <span>
            Saving will update the secure server configuration and Cloud SQL storage without interrupting active users. Blank fields retain existing configured values.
          </span>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving Secrets...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );
};
