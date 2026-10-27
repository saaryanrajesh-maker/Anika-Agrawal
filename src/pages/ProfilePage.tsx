import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Bookmark,
  FileText,
  LogOut,
  Play,
  CheckCircle2,
  XCircle,
  Database,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTrafficReports, getUserFavoriteRoutes } from '../lib/firestore';
import { runTests } from '../tests/congestion.test';
import { Badge } from '../components/ui/Badge';
import { TrafficReport, FavoriteRoute } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isFirebaseConfigured, logout } = useAuth();

  const [myReports, setMyReports] = useState<TrafficReport[]>([]);
  const [myFavorites, setMyFavorites] = useState<FavoriteRoute[]>([]);
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message?: string }[] | null>(null);

  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      const allReps = await getTrafficReports();
      setMyReports(allReps.filter((r) => r.ownerUid === currentUser.uid));
      const favs = await getUserFavoriteRoutes(currentUser.uid);
      setMyFavorites(favs);
    }
    loadUserData();
  }, [currentUser]);

  const handleRunTests = () => {
    const results = runTests();
    setTestResults(results);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Profile</h2>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const allPassed = testResults?.every((t) => t.passed);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-200">
            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser.displayName || 'Commuter'}
              </h1>
              {isAdmin ? (
                <Badge variant="indigo">Administrator</Badge>
              ) : (
                <Badge variant="blue">Commuter</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {currentUser.email}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">UID: {currentUser.uid}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Activity Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase">My Reports Filed</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{myReports.length}</div>
          <Link
            to="/reports"
            className="text-[11px] text-blue-600 hover:underline mt-2 inline-block font-medium"
          >
            View reports directory →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase">Saved Routes</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{myFavorites.length}</div>
          <Link
            to="/favorites"
            className="text-[11px] text-blue-600 hover:underline mt-2 inline-block font-medium"
          >
            Manage saved favorites →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase">Database Mode</div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-500" />
            {isFirebaseConfigured ? 'Live Firebase' : 'Demo Mode'}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Mira-Bhayandar Testbed</span>
        </div>
      </div>

      {/* IDEAL Lab Academic Unit Test Suite Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Core Algorithm Validation Suite
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit tests for time-decay weighting, Haversine polyline proximity, and route recommendation scoring.
            </p>
          </div>

          <button
            onClick={handleRunTests}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5" />
            Execute Algorithm Tests
          </button>
        </div>

        {testResults && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs text-slate-800">
                Test Execution Results ({testResults.length} Tests)
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  allPassed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {allPassed ? '✓ All 10 Tests Passed' : 'Failures Detected'}
              </span>
            </div>

            <div className="space-y-2">
              {testResults.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-slate-700 font-medium">{t.name}</span>
                  </div>
                  {t.message && <span className="text-[11px] text-slate-400">{t.message}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
