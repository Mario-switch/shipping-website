import HeroImage from '../assets/fedex-hero-plane.png';
import { useState } from 'react';
import {
  Package, Truck, Globe, Clock, ArrowRight, Search, MapPin,
  Shield, Zap, HeadphonesIcon, BarChart3, ChevronRight, Star
} from 'lucide-react';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations';

interface HomePageProps {
  onNavigate: (page: Page, data?: Record<string, string>) => void;
}

const services = [
  {
    icon: Zap,
    title: 'FedEx Overnight',
    desc: 'Next-business-day delivery by 10:30am to most areas.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Clock,
    title: 'FedEx 2Day',
    desc: 'Second-business-day delivery for time-sensitive shipments.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Truck,
    title: 'FedEx Ground',
    desc: 'Cost-effective delivery in 1-5 business days.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Globe,
    title: 'FedEx International',
    desc: 'Reliable delivery to over 220 countries and territories.',
    color: 'text-[#4D148C]',
    bg: 'bg-purple-50',
  },
];

const features = [
  { icon: Shield, title: 'Secure & Insured', desc: 'Full package protection up to declared value' },
  { icon: BarChart3, title: 'Real-time Tracking', desc: 'Monitor every step of your shipment' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Expert help whenever you need it' },
  { icon: MapPin, title: '50,000+ Locations', desc: 'Drop off at any nearby FedEx location' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'E-commerce Owner', rating: 5, text: 'FedEx has been a game-changer for my business. Reliable, fast, and the tracking is excellent.' },
  { name: 'James R.', role: 'Supply Chain Manager', rating: 5, text: 'We ship thousands of packages monthly. FedEx never lets us down on critical deadlines.' },
  { name: 'Lisa K.', role: 'Small Business Owner', rating: 5, text: 'The overnight delivery service helped me save a huge client deal. Absolutely worth it.' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [trackingInput, setTrackingInput] = useState('');

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (trackingInput.trim()) {
      onNavigate('track', { tracking: trackingInput.trim() });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative bg-gray-900 text-white overflow-hidden"
        style={{ minHeight: '580px' }}
      >
        <div
  className="absolute inset-0 bg-cover bg-center sm:bg-contain md:bg-cover lg:bg-cover opacity-30"
  
  style={{
    backgroundImage: `url(${HeroImage})`,
  }}
/>
   <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-gray-900/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-28 z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#FF6200]/20 border border-[#FF6200]/30 rounded-full px-4 py-1.5 mb-6">
              <Zap size={14} className="text-[#FF6200]" />
              <span className="text-[#FF6200] text-sm font-semibold">Faster. Smarter. More Reliable.</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Ship with
              <span className="text-[#FF6200]"> Confidence</span>,
              <br />Deliver on Time
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Connect your business to the world with FedEx. Overnight, 2-day, ground, and international shipping with real-time tracking.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('ship')}
                className="flex items-center gap-2 bg-[#FF6200] hover:bg-[#e05500] text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
              >
                <Package size={18} />
                Ship a Package
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate('track')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all backdrop-blur-sm"
              >
                <Search size={18} />
                Track Package
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Bar */}
        <div className="relative max-w-7xl mx-auto px-4 mt-8 md:mt-12 z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Track Your Package
                </label>
                <form onSubmit={handleTrack} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking number (e.g. 789456123014)"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#FF6200] hover:bg-[#e05500] text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Track
                  </button>
                </form>
                
              </div>
              <div className="hidden md:block h-12 w-px bg-gray-200" />
              <div className="hidden md:block">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Get a Rate Quote
                </label>
                <button
                  onClick={() => onNavigate('ship')}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <BarChart3 size={16} />
                  Get a Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for tracking bar overlap */}
      <div className="bg-gray-50 h-16" />

      {/* Services */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Shipping Services</h2>
            <p className="text-gray-500 text-lg">Choose the right service for your needs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc) => (
              <div
                key={svc.title}
                onClick={() => onNavigate('ship')}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 ${svc.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <svc.icon size={22} className={svc.color} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{svc.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{svc.desc}</p>
                <span className={`text-sm font-semibold ${svc.color} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                  Learn more <ChevronRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-[#FF6200] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { value: '220+', label: 'Countries Served' },
              { value: '16M+', label: 'Packages Daily' },
              { value: '650K+', label: 'Team Members' },
              { value: '99.8%', label: 'On-Time Delivery' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">
                Why businesses choose <span className="text-[#FF6200]">FedEx</span>
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                From small businesses to enterprise corporations, FedEx provides the reliability, technology, and global reach you need to compete.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <f.icon size={18} className="text-[#FF6200]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('ship')}
                className="mt-8 flex items-center gap-2 bg-[#FF6200] hover:bg-[#e05500] text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
              >
                Start Shipping Today
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="FedEx delivery"
                className="rounded-2xl shadow-xl w-full object-cover"
                style={{ height: '420px' }}
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Package size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Package #789456123016</p>
                    <p className="text-sm font-bold text-green-600">Delivered!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Trusted by Millions</h2>
            <p className="text-gray-500 text-lg">What our customers say about us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to ship smarter?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Create a free account to access discounted rates, manage shipments, and get real-time tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('signup')}
              className="flex items-center gap-2 bg-[#FF6200] hover:bg-[#e05500] text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg"
            >
              Create Free Account
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('ship')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all text-lg"
            >
              Get a Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
