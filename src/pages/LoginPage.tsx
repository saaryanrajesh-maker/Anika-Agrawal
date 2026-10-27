import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, sendPasswordReset, isFirebaseConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address in the field above to receive a password reset link.');
      return;
    }
    try {
      await sendPasswordReset(email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200/90 shadow-lg space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-200">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your commuter dashboard, save routes, and file verified reports.
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Demo Authentication Active
            </span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Firebase credentials not yet configured in <code>.env</code>. You can log in with any email (e.g. <b>admin@smarttraffic.local</b> for admin portal access) to test all features.
            </p>
          </div>
        )}

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {resetSent && (
          <Alert type="success" onClose={() => setResetSent(false)}>
            Password reset link dispatched to your email address!
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commuter@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
