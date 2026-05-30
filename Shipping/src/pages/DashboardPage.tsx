import { useState, useEffect } from 'react';
import { Package, TrendingUp, CheckCircle, Truck, Search, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase, Shipment } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { getStatusBg, getStatusLabel, formatDate } from '../lib/tracking';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations';

interface DashboardPageProps {
  onNavigate: (page: Page, data?: Record<string, string>) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) fetchShipments();
  }, [user]);

  async function fetchShipments() {
    setLoading(true);
    const { data } = await supabase
      .from('shipments')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setShipments(data || []);
    setLoading(false);
  }

  const filtered = shipments.filter(
    (s) =>
      s.tracking_number.includes(search) ||
      s.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      s.recipient_city.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: shipments.length,
    active: shipments.filter((s) => ['in_transit', 'out_for_delivery', 'pending'].includes(s.status)).length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-4">Please sign in to view your shipments.</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-[#FF6200] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#e05500] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black">My Shipments</h1>
              <p className="text-gray-400 mt-1">
                Welcome back, {profile?.full_name || user.email?.split('@')[0]}
              </p>
            </div>
            <button
              onClick={() => onNavigate('ship')}
              className="flex items-center gap-2 bg-[#FF6200] hover:bg-[#e05500] text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Package size={16} />
              New Shipment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Shipments', value: stats.total, icon: Package, color: 'text-gray-600', bg: 'bg-gray-100' },
            { label: 'Active', value: stats.active, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100' },
            { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
            <h2 className="font-black text-gray-900">Shipment History</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tracking #, recipient..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6200] transition-colors w-full sm:w-64"
                />
              </div>
              <button
                onClick={fetchShipments}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={15} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw size={24} className="animate-spin text-[#FF6200]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                {shipments.length === 0 ? 'No shipments yet' : 'No results found'}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {shipments.length === 0
                  ? 'Create your first shipment to get started.'
                  : 'Try a different search term.'}
              </p>
              {shipments.length === 0 && (
                <button
                  onClick={() => onNavigate('ship')}
                  className="flex items-center gap-2 bg-[#FF6200] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#e05500] transition-colors mx-auto"
                >
                  <Package size={15} />
                  Ship a Package
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((shipment) => (
                <div
                  key={shipment.id}
                  className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onNavigate('track', { tracking: shipment.tracking_number })}
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        shipment.status === 'delivered' ? 'bg-green-100' :
                        shipment.status === 'out_for_delivery' ? 'bg-blue-100' :
                        shipment.status === 'in_transit' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        {shipment.status === 'delivered' ? (
                          <CheckCircle size={18} className="text-green-600" />
                        ) : shipment.status === 'out_for_delivery' ? (
                          <Truck size={18} className="text-blue-600" />
                        ) : (
                          <Package size={18} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm tracking-wide">{shipment.tracking_number}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          To: <span className="font-semibold text-gray-700">{shipment.recipient_name}</span> — {shipment.recipient_city}, {shipment.recipient_state}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Shipped {formatDate(shipment.created_at)} &bull; {shipment.weight} lbs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBg(shipment.status)}`}>
                          {getStatusLabel(shipment.status)}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {shipment.status === 'delivered'
                            ? `Delivered ${formatDate(shipment.actual_delivery)}`
                            : `Est. ${formatDate(shipment.estimated_delivery)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900">${shipment.shipping_cost.toFixed(2)}</span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-[#FF6200] transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Ship a Package', desc: 'Create a new shipment', icon: Package, page: 'ship' as Page },
            { label: 'Track a Package', desc: 'Enter a tracking number', icon: Search, page: 'track' as Page },
            { label: 'View Services', desc: 'Compare shipping options', icon: TrendingUp, page: 'services' as Page },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#FF6200] hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF6200] transition-colors">
                <action.icon size={16} className="text-[#FF6200] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{action.label}</p>
                <p className="text-xs text-gray-400">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
