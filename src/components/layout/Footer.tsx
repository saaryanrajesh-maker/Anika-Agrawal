import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, MapPin, ExternalLink, GraduationCap, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span>Smart Traffic</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traffic Congestion Detection and Alternative Route Recommendation System for urban commuters and city planners.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] border border-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Semester V • IDEAL Lab Project</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  City Congestion Dashboard
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition">
                  Live Traffic Map
                </Link>
              </li>
              <li>
                <Link to="/routes" className="hover:text-white transition">
                  Alternative Route Planner
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition">
                  Submit Traffic Report
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition">
                  Traffic Reports Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Lab */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Urban Mobility Focus
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Default testbed: <b>Mira-Bhayandar, Maharashtra</b> (covering WEH, Ghodbunder Rd, Station corridors).
            </p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Theme: Sustainable Smart Cities
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                OSRM Driving Route Provider
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                OpenStreetMap Attribution
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Cloud Firestore & Vercel Ready
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Prototype Disclosure */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Academic Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
              This system is an academic research prototype. Road routes are calculated via OpenStreetMap & OSRM. Congestion scores are generated from user reports and labeled demo records. This is not an official municipal traffic sensor feed.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Smart Traffic — Urban Mobility IDEAL Lab Project.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Powered by OSRM & OpenStreetMap</span>
            <span>•</span>
            <span>Cloud Firestore Database</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
