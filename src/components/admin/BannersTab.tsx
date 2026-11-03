import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Banner } from '../../types';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Eye, 
  X,
  Smartphone,
  Monitor
} from 'lucide-react';

export const BannersTab: React.FC = () => {
  const { banners, addBanner, updateBannerStatus, deleteBanner, showToast } = useApp();
  const [activeSection, setActiveSection] = useState<'Main Banner - Desktop' | 'Main Banner - Mobile' | 'Promotional Carousel' | 'Featured Carousel'>('Main Banner - Desktop');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerName, setBannerName] = useState('');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&auto=format&fit=crop&q=80');
  const [targetUrl, setTargetUrl] = useState('/buy');
  const [altText, setAltText] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Explore Listings');

  const filteredBanners = banners.filter(b => {
    if (activeSection === 'Main Banner - Desktop') return b.section === 'Main Banner' || !b.section;
    if (activeSection === 'Main Banner - Mobile') return b.section === 'Mobile Banner';
    if (activeSection === 'Promotional Carousel') return b.section === 'Additional Promotional Banners';
    return true;
  });

  const handleOpenAdd = () => {
    setEditingBannerId(null);
    setBannerName('');
    setBannerUrl(activeSection === 'Main Banner - Mobile' 
      ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&h=600&auto=format&fit=crop&q=80');
    setTargetUrl('/buy');
    setAltText('OnRoadPriz Marketplace Campaign');
    setCtaLabel('Explore Deals');
    setModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionName = activeSection === 'Main Banner - Mobile' 
      ? 'Mobile Banner' 
      : activeSection === 'Promotional Carousel' 
      ? 'Additional Promotional Banners' 
      : 'Main Banner';

    addBanner({
      name: bannerName || 'Promotional Banner',
      title: bannerName,
      imageUrl: bannerUrl,
      targetUrl,
      altText,
      section: sectionName as any,
      status: 'Active'
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Banners Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#77101F]/10 text-[#77101F]">
              {banners.length} Active Assets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure homepage hero carousels, responsive mobile promotional slides, and category ads.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Banner Asset</span>
        </button>
      </div>

      {/* Tabs Switcher for Banners */}
      <div className="flex flex-wrap border-b border-slate-200 gap-3">
        {(['Main Banner - Desktop', 'Main Banner - Mobile', 'Promotional Carousel', 'Featured Carousel'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeSection === tab
                ? 'border-[#77101F] text-[#77101F]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.includes('Mobile') ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Recommended Dimensions Box */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-center justify-between">
        <span>
          💡 <strong>Recommended Format:</strong> {activeSection.includes('Mobile') ? '800 × 800 px (1:1 Ratio)' : '1920 × 600 px (3.2:1 Ratio)'}. WebP or JPG up to 2MB.
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Validated</span>
      </div>

      {/* Banners Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBanners.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div>
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                <img
                  src={b.imageUrl}
                  alt={b.altText || b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                }`}>
                  {b.status || 'Active'}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                <p className="text-xs text-slate-500 truncate">Target Link: <span className="font-mono text-slate-700">{b.targetUrl || '/buy'}</span></p>
                <div className="text-[11px] text-slate-400">Alt text: "{b.altText || 'Automotive Showcase'}"</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => updateBannerStatus(b.id, b.status === 'Active' ? 'Inactive' : 'Active')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                {b.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => deleteBanner(b.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Upload Banner Campaign</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  value={bannerName}
                  onChange={(e) => setBannerName(e.target.value)}
                  placeholder="e.g. Festival Season Direct Deals"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination URL</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="/buy or /sell"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#77101F] text-white font-bold rounded-xl hover:bg-[#5E0B17]"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
