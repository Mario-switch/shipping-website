import { useState } from 'react';
import { Menu, X, ChevronDown, Package, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations' | 'admin';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { label: 'Shipping', page: 'ship' as Page },
  { label: 'Tracking', page: 'track' as Page },
  { label: 'Services', page: 'services' as Page },
  { label: 'Locations', page: 'locations' as Page },
];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    onNavigate('home');
    setUserMenuOpen(false);
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="hidden md:block bg-gray-900 text-gray-300 text-xs">
  <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
          <span>United States - English</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white transition-colors">Business Solutions</span>
            <span className="cursor-pointer hover:text-white transition-colors">Developer Resources</span>
            <span className="cursor-pointer hover:text-white transition-colors">Customer Support</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 focus:outline-none group"
          >
            <div className="flex items-center">
              <span className="text-3xl font-black tracking-tighter text-[#4D148C]">Fed</span>
              <span className="text-3xl font-black tracking-tighter text-[#FF6200]">Ex</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-4 py-2 text-sm font-semibold rounded transition-colors flex items-center gap-1 ${
                  currentPage === item.page
                    ? 'text-[#FF6200]'
                    : 'text-gray-700 hover:text-[#FF6200]'
                }`}
              >
                {item.label}
                {(item.label === 'Shipping' || item.label === 'Services') && (
                  <ChevronDown size={14} />
                )}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#FF6200] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'My Account'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate('dashboard'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      My Shipments
                    </button>
                    {profile?.is_admin && (
                      <button
                        onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#FF6200] font-semibold hover:bg-orange-50 transition-colors"
                      >
                        <Shield size={15} />
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#FF6200] transition-colors"
                >
                  <User size={15} />
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('ship')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6200] text-white text-sm font-bold rounded-lg hover:bg-[#e05500] transition-colors"
                >
                  <Package size={15} />
                  <span className="hidden sm:inline">Ship Now</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setMobileOpen(false); }}
              className="w-full text-left px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#FF6200] transition-colors"
            >
              {item.label}
            </button>
          ))}
          {!user && (
            <button
              onClick={() => { onNavigate('login'); setMobileOpen(false); }}
              className="w-full text-left px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#FF6200] transition-colors"
            >
              Sign In
            </button>
          )}
          {user && (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileOpen(false); }}
                className="w-full text-left px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#FF6200] transition-colors"
              >
                My Shipments
              </button>
              {profile?.is_admin && (
                <button
                  onClick={() => { onNavigate('admin'); setMobileOpen(false); }}
                  className="w-full text-left px-6 py-3 text-sm font-semibold text-[#FF6200] hover:bg-orange-50 transition-colors"
                >
                  Admin Panel
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
