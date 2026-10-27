import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Route,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Compass,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isFirebaseConfigured } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-16 pb-24 sm:pt-20 sm:pb-32">
        {/* Ambient background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              Semester V IDEAL Lab • Urban Mobility & Sustainable Cities
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Smart Traffic Congestion Detection &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Alternative Route Recommendation
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              An intelligent spatial decision-support system helping commuters avoid urban gridlock in{' '}
              <b className="text-white font-semibold">Mira-Bhayandar, Maharashtra</b> and discover optimal alternative travel corridors.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/routes"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 text-base"
              >
                <Route className="w-5 h-5" />
                Find Alternative Routes
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 shadow-sm transition transform hover:-translate-y-0.5 text-base"
              >
                <MapPin className="w-5 h-5 text-sky-400" />
                Explore Live Traffic Map
              </Link>
            </div>

            {/* Quick stats indicator */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-blue-400">OSRM</div>
                <div className="text-xs text-slate-400 mt-1">Multi-Route Engine</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-1">Open-Source Tiles</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400">Spatial</div>
                <div className="text-xs text-slate-400 mt-1">Haversine Proximity</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-indigo-400">Firestore</div>
                <div className="text-xs text-slate-400 mt-1">
                  {isFirebaseConfigured ? 'Live Database' : 'Demo Dataset'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traffic Status Indicator Legend */}
      <section className="bg-white border-y border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Standardized Traffic Severity System
              </span>
              <h3 className="text-sm font-semibold text-slate-800">
                Real-time congestion classification mapped across urban corridors
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                <span>Low: Free flow & normal limits</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
                <span>Moderate: Intermittent slowdown (5–12m delay)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
                <span>Heavy: Major bottleneck (&gt;15m delay)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Core Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              System Architecture & Capabilities
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Built for Sustainable Urban Mobility
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Addressing everyday traffic challenges in suburban Mumbai and Mira-Bhayandar with algorithmic route intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Interactive Corridor Map
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Full-featured Leaflet mapping centered on Mira-Bhayandar. Filter incidents by severity, review delay durations, and inspect specific road bottlenecks.
              </p>
              <Link
                to="/map"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                Launch Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <Route className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                OSRM Alternative Routing
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Calculates multiple candidate driving paths between any two locations. Compares distance, nominal durations, and bypass feasibility along arterial highways.
              </p>
              <Link
                to="/routes"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                Plan Routes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Explainable Route Scoring
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Combines OSRM estimated duration with nearby reported congestion within a 750m corridor using the Haversine formula and time-decay weighting.
              </p>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                View Analytics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Crowdsourced Reporting
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Allows authenticated drivers to submit real-time condition reports with coordinate picking on the map, incident classification, and delay estimates.
              </p>
              <Link
                to="/report"
                className="text-sm font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
              >
                Submit Report <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Saved Favorite Routes
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Bookmark frequent commuter routes (e.g. Home to College, Kashimira to Bhayandar West) and re-check traffic conditions in one click.
              </p>
              <Link
                to="/favorites"
                className="text-sm font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
              >
                View Favorites <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Admin Triage & Audit
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Role-based administrative moderation tools to review, verify, or remove duplicate reports with Firestore security rules preventing unauthorized manipulation.
              </p>
              <Link
                to="/admin"
                className="text-sm font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1"
              >
                Admin Review <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How the Recommendation Engine Works */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              The Scientific Workflow
            </span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              How Alternative Routes Are Evaluated
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Transparent, explainable criteria instead of black-box estimations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">OSRM Route Discovery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The user inputs Origin and Destination. The OSRM routing service queries OpenStreetMap road topology to calculate the primary arterial and alternative viable bypass routes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Spatial Proximity Analysis</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The algorithm scans all recent traffic incident reports. Using the Haversine formula, it identifies reports falling within a 750-meter buffer zone around each route's polyline coordinates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Weighted Scoring & Ranking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A composite score balances nominal driving duration (60% weight) against reported congestion severity and recency decay (40% weight) to recommend the least congested alternative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Benefits */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
                Urban Mobility & Sustainable Cities
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Why Alternative Route Intelligence Matters
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Urban bottlenecks on arterial bridges and railway crossings create vehicle idling, excessive fuel consumption, and transit delays. By distributing traffic onto underutilized bypass corridors, smart recommendation reduces peak congestion.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><b>For Daily Commuters:</b> Save travel time, avoid known roadwork blocks, and bypass railway station choke points.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><b>For City Planners:</b> Identify recurring congestion hotspots on Western Express Highway and Ghodbunder Road for targeted infrastructure improvements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><b>For Sustainable Cities:</b> Decrease greenhouse emissions caused by prolonged idling in dense urban centers.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <h4 className="font-bold text-white text-base">
                Demonstration Testbed: Mira-Bhayandar
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Selected as the primary testbed due to its rapid urban growth and key transport chokepoints:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                  <span>Kashimira WEH Junction</span>
                  <span className="text-rose-400 font-semibold">Frequent Peak Bottleneck</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                  <span>Mira Road Station Road</span>
                  <span className="text-rose-400 font-semibold">Shared Auto & Bus Congestion</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                  <span>Bhayandar East-West Overbridge</span>
                  <span className="text-amber-400 font-semibold">Railway Barrier Crossing</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                  <span>Beverly Park / Kanakia Roads</span>
                  <span className="text-emerald-400 font-semibold">Low-Density Bypass Arterials</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/routes"
                  className="w-full text-center block py-2.5 px-4 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl text-xs transition"
                >
                  Test Route Planner in Mira-Bhayandar →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
