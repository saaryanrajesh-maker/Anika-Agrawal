import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  Route,
  BarChart3,
  PlusCircle,
  FileText,
  Bookmark,
  Shield,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { currentUser, isFirebaseConfigured, isDemoMode, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'Live Map', path: '/map', icon: MapPin },
    { label: 'Route Planner', path: '/routes', icon: Route },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-bar for Demo / Firebase connection status */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="font-semibold text-white tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Urban Mobility IDEAL Lab:
          </span>
          <span className="hidden sm:inline text-slate-400">
            Mira-Bhayandar Urban Mobility & Alternative Route Decision System
          </span>
          <div className="ml-auto flex items-center gap-2">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <Database className="w-3 h-3" /> Firebase Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800">
                <Sparkles className="w-3 h-3" /> Demo Mode (Mira-Bhayandar)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-slate-900 text-lg group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="tracking-tight text-slate-950 font-extrabold">Smart</span>
              <span className="tracking-tight text-blue-600 font-extrabold">Traffic</span>
              <span className="hidden md:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                Sem V
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Submit Report action button */}
            <Link
              to="/report"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ml-1 ${
                isActive('/report')
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              Report Traffic
            </Link>

            {/* Saved Routes if logged in */}
            {currentUser && (
              <Link
                to="/favorites"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/favorites')
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Favorites
              </Link>
            )}

            {/* Admin link if user has admin privileges */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin')
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Profile / Auth */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-4 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-slate-500" />
                {link.label}
              </Link>
            );
          })}

          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium text-amber-800 bg-amber-50"
          >
            <PlusCircle className="w-5 h-5 text-amber-600" />
            Report Traffic
          </Link>

          {currentUser && (
            <Link
              to="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              <Bookmark className="w-5 h-5 text-slate-500" />
              Favorite Routes
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium text-purple-800 bg-purple-50"
            >
              <Shield className="w-5 h-5 text-purple-600" />
              Admin Portal
            </Link>
          )}

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-800 font-medium"
                >
                  <User className="w-5 h-5 text-slate-500" />
                  Profile ({currentUser.displayName})
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-rose-600 font-medium text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 rounded-lg border border-slate-200 text-slate-700 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 rounded-lg bg-blue-600 text-white font-medium shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
