import { useState, useEffect } from 'react';
import { Search, Package, MapPin, CheckCircle, AlertCircle, Truck, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase, Shipment, TrackingEvent } from '../lib/supabase';
import { getStatusBg, getStatusLabel, getProgressStep, formatDate, formatDateTime } from '../lib/tracking';

interface TrackingPageProps {
  initialTracking?: string;
}

const steps = [
  { label: 'Label Created', icon: Package },
  { label: 'Picked Up', icon: Truck },
  { label: 'In Transit', icon: Truck },
  { label: 'Out for Delivery', icon: MapPin },
  { label: 'Delivered', icon: CheckCircle },
];

export default function TrackingPage({ initialTracking }: TrackingPageProps) {
  const [trackingInput, setTrackingInput] = useState(initialTracking || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialTracking) {
      handleSearch(initialTracking);
    }
  }, [initialTracking]);

  async function handleSearch(number?: string) {
    const query = (number || trackingInput).trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setSearched(true);

    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', query)
      .maybeSingle();

    if (shipmentError || !shipmentData) {
      setShipment(null);
      setEvents([]);
      setError('No shipment found with that tracking number. Please check and try again.');
      setLoading(false);
      return;
    }

    setShipment(shipmentData);

    const { data: eventsData } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipmentData.id)
      .order('timestamp', { ascending: false });

    setEvents(eventsData || []);
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch();
  }

  const progressStep = shipment ? getProgressStep(shipment.status) : 0;
  const isException = shipment?.status === 'exception';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-black mb-2">Track Your Package</h1>
          <p className="text-gray-400">Enter your FedEx tracking number to get real-time updates</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter FedEx tracking number..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6200] transition-colors font-medium text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#FF6200] hover:bg-[#e05500] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              Track
            </button>
          </form>

          
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 items-start mb-6">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Tracking Not Found</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {shipment && (
          <div className="space-y-5">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tracking Number</p>
                    <p className="text-xl font-black text-gray-900 tracking-wider">{shipment.tracking_number}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusBg(shipment.status)}`}>
                    {getStatusLabel(shipment.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Service</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      FedEx {shipment.service_type === '2day' ? '2Day' : shipment.service_type.charAt(0).toUpperCase() + shipment.service_type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Ship Date</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(shipment.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Est. Delivery</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {shipment.status === 'delivered'
                        ? formatDate(shipment.actual_delivery)
                        : formatDate(shipment.estimated_delivery)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Weight</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{shipment.weight} lbs</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {!isException && (
                <div className="px-6 py-5 bg-gray-50">
                  <div className="flex items-center justify-between relative">
                    {/* Line */}
                    <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 z-0" style={{ marginLeft: '10%', marginRight: '10%' }}>
                      <div
                        className="h-full bg-[#FF6200] transition-all duration-700"
                        style={{ width: `${((progressStep - 1) / (steps.length - 1)) * 100}%` }}
                      />
                    </div>

                    {steps.map((step, i) => {
                      const stepNum = i + 1;
                      const done = stepNum < progressStep;
                      const current = stepNum === progressStep;
                      return (
                        <div key={step.label} className="flex flex-col items-center z-10" style={{ flex: '0 0 20%' }}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-[#FF6200] border-[#FF6200]'
                              : current
                              ? 'bg-white border-[#FF6200] shadow-md shadow-orange-100'
                              : 'bg-white border-gray-200'
                          }`}>
                            <step.icon size={16} className={done || current ? (done ? 'text-white' : 'text-[#FF6200]') : 'text-gray-300'} />
                          </div>
                          <span className={`text-xs font-semibold mt-2 text-center leading-tight ${
                            done || current ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isException && (
                <div className="px-6 py-4 bg-red-50 flex gap-3 items-center">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-sm font-semibold text-red-700">Delivery exception — action may be required</p>
                </div>
              )}
            </div>

            {/* From/To */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wide">Shipment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-[#FF6200]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">From</p>
                    <p className="font-bold text-gray-900">{shipment.sender_name}</p>
                    <p className="text-sm text-gray-500">{shipment.sender_city}, {shipment.sender_state} {shipment.sender_zip}</p>
                    <p className="text-sm text-gray-500">{shipment.sender_country}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">To</p>
                    <p className="font-bold text-gray-900">{shipment.recipient_name}</p>
                    <p className="text-sm text-gray-500">{shipment.recipient_city}, {shipment.recipient_state} {shipment.recipient_zip}</p>
                    <p className="text-sm text-gray-500">{shipment.recipient_country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {events.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-black text-gray-900 mb-5 text-sm uppercase tracking-wide">Tracking History</h3>
                <div className="space-y-0">
                  {events.map((event, i) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 ${
                          i === 0 ? 'bg-[#FF6200] border-[#FF6200]' : 'bg-gray-200 border-gray-300'
                        }`} />
                        {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className={`pb-5 ${i < events.length - 1 ? '' : ''}`}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className={`font-bold text-sm ${i === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                            {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-400">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !searched && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-[#FF6200]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Enter Your Tracking Number</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Enter your FedEx tracking number above to see the current status and history of your shipment.
            </p>
            
          </div>
        )}
      </div>
    </div>
  );
}
