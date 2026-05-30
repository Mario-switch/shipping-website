import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Calendar,
  ArrowUpDown,
  GripVertical,
} from 'lucide-react';
import { supabase, Shipment, TrackingEvent } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { getStatusLabel, getStatusBg, formatDate } from '../lib/tracking';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations' | 'admin';

interface AdminPageProps {
  onNavigate: (page: Page) => void;
}

type ShipmentWithEvents = Shipment & { tracking_events: TrackingEvent[] };

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'label_created', label: 'Label Created', icon: Package },
  { value: 'picked_up', label: 'Picked Up', icon: Truck },
  { value: 'in_transit', label: 'In Transit', icon: MapPin },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  { value: 'exception', label: 'Exception', icon: AlertCircle },
];

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { user, profile } = useAuth();
  const [shipments, setShipments] = useState<ShipmentWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = profile?.is_admin === true;

  useEffect(() => {
    if (user && isAdmin) {
      fetchShipments();
    }
  }, [user, isAdmin]);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('shipments')
      .select('*, tracking_events(*)')
      .order('created_at', { ascending: false });

    if (err) {
      setError('Failed to load shipments');
    } else {
      setShipments(
        (data || []).map((s) => ({
          ...s,
          tracking_events: (s.tracking_events || []).sort(
            (a: TrackingEvent, b: TrackingEvent) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
        }))
      );
    }
    setLoading(false);
  }, []);

  const filtered = shipments.filter(
    (s) =>
      s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
      s.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      s.sender_name.toLowerCase().includes(search.toLowerCase())
  );

  async function updateShipmentStatus(shipmentId: string, newStatus: string) {
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('shipments').update({ status: newStatus }).eq('id', shipmentId);
    if (err) {
      setError('Failed to update status');
    } else {
      setSuccess('Status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchShipments();
    }
    setSaving(false);
  }

  async function updateTrackingEvent(eventId: string, updates: Partial<TrackingEvent>) {
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('tracking_events').update(updates).eq('id', eventId);
    if (err) {
      setError('Failed to update event');
    } else {
      setSuccess('Event updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchShipments();
      setEditingEvent(null);
    }
    setSaving(false);
  }

  async function addTrackingEvent(shipmentId: string) {
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('tracking_events').insert({
      shipment_id: shipmentId,
      status: 'in_transit',
      description: 'New tracking event',
      location: 'Location',
      timestamp: new Date().toISOString(),
    });
    if (err) {
      setError('Failed to add event');
    } else {
      setSuccess('Event added successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchShipments();
    }
    setSaving(false);
  }

  async function deleteTrackingEvent(eventId: string) {
    if (!confirm('Delete this tracking event?')) return;
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('tracking_events').delete().eq('id', eventId);
    if (err) {
      setError('Failed to delete event');
    } else {
      setSuccess('Event deleted');
      setTimeout(() => setSuccess(''), 3000);
      fetchShipments();
    }
    setSaving(false);
  }

  async function updateEventOrder(shipmentId: string, eventIndex: number, direction: 'up' | 'down') {
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (!shipment) return;

    const events = [...shipment.tracking_events];
    const newIndex = direction === 'up' ? eventIndex + 1 : eventIndex - 1;
    if (newIndex < 0 || newIndex >= events.length) return;

    [events[eventIndex], events[newIndex]] = [events[newIndex], events[eventIndex]];

    const newTimestamps = events.map((e, idx) => {
      const baseDate = new Date();
      baseDate.setHours(baseDate.getHours() - (events.length - idx - 1) * 6);
      return baseDate.toISOString();
    });

    setSaving(true);
    for (let i = 0; i < events.length; i++) {
      await supabase
        .from('tracking_events')
        .update({ timestamp: newTimestamps[i] })
        .eq('id', events[i].id);
    }
    setSuccess('Event order updated');
    setTimeout(() => setSuccess(''), 3000);
    fetchShipments();
    setSaving(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-4">Please sign in to access admin panel.</p>
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">You don't have admin privileges.</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FF6200] rounded-lg flex items-center justify-center">
              <Package size={20} />
            </div>
            <h1 className="text-3xl font-black">Admin Panel</h1>
          </div>
          <p className="text-gray-400">Manage shipments and tracking events</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tracking number, sender, or recipient..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors"
              />
            </div>
            <button
              onClick={fetchShipments}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="hidden md:grid px-4 py-2 bg-gray-50 border-t border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide grid-cols-12 gap-4">
            <div className="col-span-3">Tracking #</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Route</div>
            <div className="col-span-2">Service</div>
            <div className="col-span-2">Created</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Package size={32} className="mx-auto mb-2 animate-pulse" />
              Loading shipments...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package size={32} className="mx-auto mb-2" />
              No shipments found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((shipment) => (
                <div key={shipment.id}>
                  <div
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                   onClick={() => setExpandedId(expandedId === shipment.id ? null : shipment.id)}>
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 md:items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                            {expandedId === shipment.id ? (
                                <ChevronDown size={16} className="text-gray-400" />
                            ) : (
                            <ChevronRight size={16} className="text-gray-400" />
                            )}
                             <span className="font-mono font-bold text-[#4D148C]">{shipment.tracking_number}</span>
                             </div>
                              <div className="md:col-span-2">
                                <select
                                value={shipment.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateShipmentStatus(shipment.id, e.target.value)}
                                 disabled={saving}
                                 className={`w-full px-2 py-1 text-xs font-bold rounded border-2 ${getStatusBg(shipment.status)} focus:outline-none focus:border-[#FF6200]`}>
                                    {STATUS_OPTIONS.map((opt) => (
                                         <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                            </option>
                                        ))}
                                        </select>
                                        </div>
                                        <div className="md:col-span-3 text-sm">
                                            <div className="text-gray-600">
                                                {shipment.sender_city}, {shipment.sender_state}
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    to {shipment.recipient_city}, {shipment.recipient_state}
                                                    </div>
                                                    </div>
                                                    <div className="hidden md:block md:col-span-2 text-sm font-semibold text-gray-700 capitalize">
                                                         {shipment.service_type}
                                                         </div>
                                                         <div className="hidden md:block md:col-span-2 text-sm text-gray-500">{formatDate(shipment.created_at)}</div>
                                                         </div>
                                                         </div>

                  {expandedId === shipment.id && (
                    <div className="bg-gray-50 border-t border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                          <MapPin size={18} className="text-[#FF6200]" />
                          Tracking History ({shipment.tracking_events.length} events)
                        </h3>
                        <button
                          onClick={() => addTrackingEvent(shipment.id)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-[#FF6200] text-white rounded-lg font-bold hover:bg-[#e05500] transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                          Add Event
                        </button>
                      </div>

                      <div className="space-y-3">
                        {shipment.tracking_events.map((event, idx) => (
                          <div
                            key={event.id}
                            className="bg-white rounded-lg border-2 border-gray-200 p-4 relative"
                          >
                            {editingEvent === event.id ? (
                              <EventEditor
                                event={event}
                                onSave={(updates) => updateTrackingEvent(event.id, updates)}
                                onCancel={() => setEditingEvent(null)}
                                saving={saving}
                              />
                            ) : (
                              <div className="flex items-start gap-4">
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => updateEventOrder(shipment.id, idx, 'up')}
                                    disabled={saving || idx === shipment.tracking_events.length - 1}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move earlier"
                                  >
                                    <ArrowUpDown size={14} className="text-gray-400 rotate-180" />
                                  </button>
                                  <button
                                    onClick={() => updateEventOrder(shipment.id, idx, 'down')}
                                    disabled={saving || idx === 0}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move later"
                                  >
                                    <ArrowUpDown size={14} className="text-gray-400" />
                                  </button>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span
                                      className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusBg(event.status)}`}
                                    >
                                      {getStatusLabel(event.status)}
                                    </span>
                                    <span className="text-sm text-gray-500">{event.location}</span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700">{event.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingEvent(event.id)}
                                    className="p-2 text-gray-400 hover:text-[#FF6200] hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => deleteTrackingEvent(event.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventEditor({
  event,
  onSave,
  onCancel,
  saving,
}: {
  event: TrackingEvent;
  onSave: (updates: Partial<TrackingEvent>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [status, setStatus] = useState(event.status);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [timestamp, setTimestamp] = useState(event.timestamp.slice(0, 16));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200]"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200]"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time</label>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200]"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSave({
              status,
              description,
              location,
              timestamp: new Date(timestamp).toISOString(),
            })
          }
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6200] text-white font-bold rounded-lg hover:bg-[#e05500] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          Save
        </button>
      </div>
    </div>
  );
}
