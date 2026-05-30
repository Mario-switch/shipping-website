import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations' | 'admin';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onNavigate: (page: Page) => void;
}

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError('Invalid email or password. Please try again.');
      } else {
        onNavigate('dashboard');
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        setError(err.message || 'Failed to create account. Please try again.');
      } else {
        onNavigate('dashboard');
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?auto=compress&cs=tinysrgb&w=1200)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/60" />

        <div className="relative">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1">
            <span className="text-3xl font-black tracking-tighter text-white">Fed</span>
            <span className="text-3xl font-black tracking-tighter text-[#FF6200]">Ex</span>
          </button>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-black mb-4 leading-tight">
            {isLogin ? 'Welcome back to FedEx' : 'Join FedEx today'}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {isLogin
              ? 'Access your shipments, track packages, and manage your account all in one place.'
              : 'Create a free account to ship packages, track deliveries, and access exclusive business rates.'}
          </p>

          <div className="space-y-4">
            {[
              { title: 'Real-time Tracking', desc: 'Monitor every package in real-time' },
              { title: 'Discounted Rates', desc: 'Save up to 40% with an account' },
              { title: 'Shipment History', desc: 'View all past and current shipments' },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#FF6200] rounded-full flex items-center justify-center flex-shrink-0">
                  <Package size={12} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">{benefit.title}</p>
                  <p className="text-gray-400 text-xs">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-gray-500">
          &copy; {new Date().getFullYear()} FedEx Corporation. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1 mb-8 lg:hidden">
            <span className="text-2xl font-black tracking-tighter text-gray-900">Fed</span>
            <span className="text-2xl font-black tracking-tighter text-[#FF6200]">Ex</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-1">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => onNavigate(isLogin ? 'signup' : 'login')}
                className="text-[#FF6200] font-semibold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                    required
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-[#FF6200] hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FF6200] hover:bg-[#e05500] disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm mt-2"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                By {isLogin ? 'signing in' : 'creating an account'}, you agree to FedEx's{' '}
                <a href="#" className="text-[#FF6200] hover:underline">Terms of Use</a> and{' '}
                <a href="#" className="text-[#FF6200] hover:underline">Privacy Notice</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
