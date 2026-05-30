import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TrackingPage from './pages/TrackingPage';
import ShippingPage from './pages/ShippingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations' | 'admin';

interface NavigationData {
  tracking?: string;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [navData, setNavData] = useState<NavigationData>({});
  const { loading, user } = useAuth();

  function handleNavigate(page: Page, data?: Record<string, string>) {
    setCurrentPage(page);
    setNavData(data || {});
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    if (!loading && currentPage === 'dashboard' && !user) {
      setCurrentPage('login');
    }
  }, [loading, user, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-4xl font-black tracking-tighter text-[#4D148C]">Fed</span>
            <span className="text-4xl font-black tracking-tighter text-[#FF6200]">Ex</span>
          </div>
          <div className="w-8 h-8 border-4 border-[#FF6200] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const showHeaderFooter = !['login', 'signup'].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeaderFooter && <Header currentPage={currentPage} onNavigate={handleNavigate} />}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'track' && <TrackingPage initialTracking={navData.tracking} />}
        {currentPage === 'ship' && <ShippingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <AuthPage mode="login" onNavigate={handleNavigate} />}
        {currentPage === 'signup' && <AuthPage mode="signup" onNavigate={handleNavigate} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
        {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'locations' && <LocationsPage onNavigate={handleNavigate} />}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

function ServicesPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const services = [
    { name: 'FedEx Priority Overnight', desc: 'Next-business-day delivery by 10:30 AM', delivery: 'Next Day', icon: '⚡' },
    { name: 'FedEx 2Day', desc: 'Second-business-day delivery', delivery: '2 Days', icon: '🕐' },
    { name: 'FedEx Ground', desc: 'Cost-effective delivery in 1-5 business days', delivery: '1-5 Days', icon: '🚛' },
    { name: 'FedEx International Priority', desc: 'International delivery in 1-3 business days', delivery: '1-3 Days', icon: '🌍' },
    { name: 'FedEx Freight', desc: 'Heavy and oversized shipments', delivery: '2-5 Days', icon: '📦' },
    { name: 'FedEx SameDay', desc: 'Door-to-door delivery within hours', delivery: 'Same Day', icon: '🚀' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-black">Shipping Services</h1>
          <p className="text-gray-400 mt-2">Choose the right service for your needs</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{svc.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{svc.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{svc.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Delivery</span>
                <span className="text-sm font-bold text-[#FF6200]">{svc.delivery}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('ship')}
            className="bg-[#FF6200] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#e05500] transition-colors"
          >
            Ship a Package
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationsPage({ onNavigate: _onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-black">Find a Location</h1>
          <p className="text-gray-400 mt-2">Over 50,000 locations worldwide</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📍</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Find Nearby Locations</h2>
          <p className="text-gray-500 mb-6">Search by city, state, or ZIP code to find the nearest FedEx location.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter city or ZIP code"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6200] transition-colors"
            />
            <button className="bg-[#FF6200] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#e05500] transition-colors">
              Search
            </button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['Worldwide', 'Drop Box', 'FedEx Office'].map((type) => (
            <div key={type} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="font-bold text-gray-900">{type}</p>
              <p className="text-xs text-gray-500">50,000+ locations</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
