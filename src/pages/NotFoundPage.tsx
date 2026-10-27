import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, MapPin } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Corridor Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested page or navigation corridor does not exist or has been relocated.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
          <Link
            to="/routes"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
          >
            <MapPin className="w-4 h-4" /> Route Planner
          </Link>
        </div>
      </div>
    </div>
  );
};
