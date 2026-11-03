import React from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Lock, 
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate, setActiveCategoryFilter, currentUser, settings } = useApp();

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategoryFilter(categoryName);
    navigate('/buy');
  };

  const isAdminUser = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin' || currentUser.role === 'admin');

  return (
    <footer className="bg-[#0B0F19] text-white border-t-4 border-[#77101F]">
      {/* Upper Trust Strip (Trussets maroon accent) */}
      <div className="bg-gradient-to-r from-[#77101F] via-[#660C19] to-[#5E0B17] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Direct Owner To Buyer</h4>
              <p className="text-xs text-white/80">0% dealer brokerage and commission</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Verified Vehicle History</h4>
              <p className="text-xs text-white/80">RC, Insurance, PUC & Chassis audit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Direct Owner Contact</h4>
              <p className="text-xs text-white/80">Direct phone & WhatsApp with verified owners</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Pan-India Marketplace</h4>
              <p className="text-xs text-white/80">Hyderabad, Bengaluru, AP & major hubs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => { setActiveCategoryFilter(null); navigate('/'); }}
              className="inline-flex items-center p-2 rounded-xl bg-white shadow-xs cursor-pointer group w-fit transition-transform hover:scale-[1.02]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveCategoryFilter(null); navigate('/'); } }}
              aria-label="OnRoadPriz Home"
            >
              <BrandLogo variant="footer" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              India's trusted direct-owner vehicle marketplace. Buy and sell used cars, bikes, commercial lorries, passenger buses, tractors, and heavy construction machinery with 0% brokerage.
            </p>
            <div className="hidden space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#77101F] shrink-0" />
                <span>{settings?.headquartersAddress || 'OnRoadPriz Towers, Financial District, Hyderabad, Telangana'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#77101F] shrink-0" />
                <span>{settings?.supportPhone || '+91 891 278 4590'} (Mon-Sat 9AM - 8PM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#77101F] shrink-0" />
                <span>{settings?.supportEmail || 'support@onroadpriz.com'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
              Vehicle Catalog
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => handleCategoryClick('Cars')} className="hover:text-white transition-colors">
                  Cars & SUVs
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Bikes & Scooters')} className="hover:text-white transition-colors">
                  Bikes & Scooters
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Trucks & Lorries')} className="hover:text-white transition-colors">
                  Trucks & Lorries
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Buses')} className="hover:text-white transition-colors">
                  Buses & Coaches
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Tractors & Backhoe Loaders')} className="hover:text-white transition-colors">
                  Tractors & Loaders
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Heavy Machinery')} className="hover:text-white transition-colors">
                  Heavy Machinery
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => navigate('/buy')} className="hover:text-white transition-colors">Buy Vehicles</button></li>
              <li><button onClick={() => navigate('/sell')} className="hover:text-white transition-colors">Sell Your Vehicle</button></li>
              <li><button onClick={() => navigate('/plans')} className="hover:text-white transition-colors">Seller Plans</button></li>
              <li><button onClick={() => navigate('/compare')} className="hover:text-white transition-colors">Compare Vehicles</button></li>
              <li><button onClick={() => navigate('/wishlist')} className="hover:text-white transition-colors">My Wishlist</button></li>
              <li><button onClick={() => navigate('/blogs')} className="hover:text-white transition-colors">Guides & Advice</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms & Guidelines</button></li>
              <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About OnRoadPriz</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact Support</button></li>
            </ul>
          </div>

          {/* Hubs & Protected Admin Access */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
              Key Locations
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span>Hyderabad (Kokapet / HITEC)</span></li>
              <li><span>Visakhapatnam (VIP Road)</span></li>
              <li><span>Vijayawada (Benz Circle)</span></li>
              <li><span>Bengaluru (Whitefield)</span></li>
              <li><span>Chennai (Anna Nagar)</span></li>
              <li><span>Mumbai (Bandra West)</span></li>
              <li><span>Amaravati & Guntur</span></li>
            </ul>

            {/* ONLY rendered for authorized admin users */}
            {isAdminUser && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full py-2 px-3 bg-amber-500/10 hover:bg-[#77101F] text-xs font-semibold rounded-lg text-amber-300 hover:text-white border border-amber-500/20 hover:border-[#77101F] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Admin Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 items-center text-xs text-slate-500 gap-4">
          <p className="text-center md:text-left">
            © 2026 OnRoadPriz Technologies Pvt Ltd. All rights reserved.
          </p>
          <p className="text-center">
            Crafted with passion by{' '}
            <a 
              href="https://brandorigin.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-white underline inline-flex items-center gap-1 transition-colors"
            >
              BrandOrigin
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-300 cursor-pointer transition-colors">Terms & Conditions</button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-300 cursor-pointer transition-colors">Help Center</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
