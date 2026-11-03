import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/common/AuthModal';
import { LocationModal } from './components/common/LocationModal';
import { HomePage } from './components/home/HomePage';
import { BuyVehiclesPage } from './components/marketplace/BuyVehiclesPage';
import { VehicleDetailPage } from './components/marketplace/VehicleDetailPage';
import { SellVehiclePage } from './components/seller/SellVehiclePage';
import { ComparePage } from './components/marketplace/ComparePage';
import { PlansPage } from './components/seller/PlansPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WishlistPage } from './components/common/WishlistPage';
import { BlogsPage, BlogDetailPage } from './components/content/BlogsPage';
import { AboutContactPage } from './components/common/AboutContactPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { PrivacyPolicyPage } from './components/common/PrivacyPolicyPage';
import { TermsAndConditionsPage } from './components/common/TermsAndConditionsPage';
import { AccountDeletionPage } from './components/common/AccountDeletionPage';
import { AndroidNativeService } from './services/androidNativeService';
import { SlidersHorizontal, ArrowRight, X, Home, Car, PlusCircle, User, Heart, WifiOff, RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    currentPath, 
    compareList, 
    navigate, 
    clearCompare, 
    isLocationModalOpen, 
    setLocationModalOpen 
  } = useApp();

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  // Initialize Android Native Back Button, Deep Links & Network Listeners
  useEffect(() => {
    AndroidNativeService.init({
      onBackPress: () => {
        // 1. Close location modal if open
        if (isLocationModalOpen) {
          setLocationModalOpen(false);
          return true;
        }

        // 2. If on sub-route, navigate back towards main routes
        if (currentPath.startsWith('/buy/') || currentPath.startsWith('/vehicle/')) {
          navigate('/buy');
          return true;
        }
        if (currentPath.startsWith('/blog/')) {
          navigate('/blogs');
          return true;
        }
        if (currentPath === '/compare' || currentPath === '/sell' || currentPath === '/wishlist' || currentPath === '/profile' || currentPath === '/plans') {
          navigate('/');
          return true;
        }
        if (
          currentPath === '/privacy' ||
          currentPath === '/privacy-policy' ||
          currentPath === '/terms' ||
          currentPath === '/terms-of-service' ||
          currentPath === '/terms-and-conditions' ||
          currentPath === '/guidelines' ||
          currentPath === '/account-deletion'
        ) {
          navigate('/');
          return true;
        }

        // Return false to allow default Android behavior (exit app if on home)
        return false;
      },
      onDeepLink: (url: string) => {
        try {
          const parsed = new URL(url);
          if (parsed.pathname) {
            navigate(parsed.pathname);
          }
        } catch {
          // ignore
        }
      },
      onNetworkChange: (status) => {
        setIsOnline(status.connected);
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentPath, isLocationModalOpen, setLocationModalOpen, navigate]);

  // Route Dispatcher
  const renderCurrentRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage />;
    }
    if ((currentPath.startsWith('/buy/') && currentPath !== '/buy') || 
        (currentPath.startsWith('/vehicle/') && currentPath !== '/vehicle')) {
      return <VehicleDetailPage />;
    }
    if (currentPath === '/buy') {
      return <BuyVehiclesPage />;
    }
    if (currentPath === '/sell') {
      return <SellVehiclePage />;
    }
    if (currentPath === '/compare') {
      return <ComparePage />;
    }
    if (currentPath.startsWith('/plans') || currentPath === '/seller/plans' || currentPath === '/buyer/plans') {
      return <PlansPage />;
    }
    if (currentPath === '/admin') {
      return <AdminDashboard />;
    }
    if (currentPath === '/profile') {
      return <ProfilePage />;
    }
    if (currentPath === '/wishlist') {
      return <WishlistPage />;
    }
    if (currentPath === '/blogs') {
      return <BlogsPage />;
    }
    if (currentPath.startsWith('/blog/')) {
      return <BlogDetailPage />;
    }
    if (currentPath === '/about' || currentPath === '/contact') {
      return <AboutContactPage />;
    }
    if (
      currentPath === '/terms' ||
      currentPath === '/terms-of-service' ||
      currentPath === '/terms-and-conditions' ||
      currentPath === '/guidelines'
    ) {
      return <TermsAndConditionsPage />;
    }
    if (currentPath === '/privacy' || currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (currentPath === '/account-deletion' || currentPath === '/delete-account') {
      return <AccountDeletionPage />;
    }
    // Fallback to Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#101828] selection:bg-[#77101F] selection:text-white pb-16 lg:pb-0">
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>No internet connection. Tap retry to reconnect.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 bg-white text-amber-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Global Notifications */}
      <ToastContainer />

      {/* Auth Modal */}
      <AuthModal />

      {/* Location Selector Modal */}
      <LocationModal />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      {/* Floating Comparison Drawer (When user selects 1 or more vehicles) */}
      {compareList.length > 0 && currentPath !== '/compare' && (
        <aside aria-label="Vehicle comparison dock" className="fixed bottom-20 lg:bottom-4 right-4 z-40 bg-[#101828] text-white rounded-2xl shadow-2xl border border-white/10 p-3 sm:p-4 flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#77101F] flex items-center justify-center text-white shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{compareList.length} Vehicles in Compare</div>
              <div className="text-[10px] text-white/70">Side-by-side spec comparison</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/compare')}
              className="px-3.5 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearCompare}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Footer */}
      <Footer />

      {/* Android Bottom Navigation Bar (Home, Buy, Sell, Wishlist, Profile) */}
      <nav aria-label="Mobile Bottom Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCE3EC] px-3 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentPath === '/' ? 'text-[#77101F]' : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </button>

        <button
          onClick={() => navigate('/buy')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentPath.startsWith('/buy') || currentPath.startsWith('/vehicle') ? 'text-[#77101F]' : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Buy</span>
        </button>

        <button
          onClick={() => navigate('/sell')}
          className="flex flex-col items-center justify-center -mt-5 bg-[#77101F] text-white p-2.5 rounded-full shadow-lg hover:bg-[#5E0B17] transition-all group scale-105 active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Sell</span>
        </button>

        <button
          onClick={() => navigate('/wishlist')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentPath === '/wishlist' ? 'text-[#77101F]' : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Wishlist</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentPath === '/profile' ? 'text-[#77101F]' : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
