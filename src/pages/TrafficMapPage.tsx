import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { TrafficMap } from '../components/map/TrafficMap';
import { getTrafficReports } from '../lib/firestore';
import { TrafficReport, CongestionLevel } from '../types';
import { MIRA_BHAYANDAR_CENTER, MIRA_BHAYANDAR_PRESETS } from '../lib/demoData';
import { searchLocations } from '../services/geocodingService';
import { Badge } from '../components/ui/Badge';

export const TrafficMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<'all' | CongestionLevel>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ displayName: string; latitude: number; longitude: number }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<TrafficReport | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    MIRA_BHAYANDAR_CENTER.latitude,
    MIRA_BHAYANDAR_CENTER.longitude,
  ]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getTrafficReports();
        setReports(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter reports
  const displayedReports = reports.filter((report) => {
    if (severityFilter === 'all') return true;
    return report.congestionLevel === severityFilter;
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        setMapCenter([results[0].latitude, results[0].longitude]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setSearchResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Urban Traffic Map
            </h1>
            <Badge variant="blue">Mira-Bhayandar, MH</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time crowdsourced reports and road condition monitoring across major transit corridors.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                severityFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setSeverityFilter('heavy')}
              className={`px-3 py-1.5 rounded-lg transition ${
                severityFilter === 'heavy'
                  ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Heavy
            </button>
            <button
              onClick={() => setSeverityFilter('moderate')}
              className={`px-3 py-1.5 rounded-lg transition ${
                severityFilter === 'moderate'
                  ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              Moderate
            </button>
            <button
              onClick={() => setSeverityFilter('low')}
              className={`px-3 py-1.5 rounded-lg transition ${
                severityFilter === 'low'
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Low
            </button>
          </div>

          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Traffic Here
          </button>
        </div>
      </div>

      {/* Location Search Bar & Quick Presets */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <form onSubmit={handleSearch} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, junction or landmark (e.g., Kashimira, Mira Road Station, Western Express Highway)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Locate'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1 animate-in fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Search Results
            </span>
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(res.latitude, res.longitude)}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 transition flex items-center justify-between"
              >
                <span className="truncate pr-2">{res.displayName}</span>
                <span className="text-[10px] text-blue-600 font-medium shrink-0">Pan to map →</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Location Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 text-[11px]">Popular Hotspots:</span>
          {MIRA_BHAYANDAR_PRESETS.slice(0, 5).map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setMapCenter([preset.lat, preset.lng])}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <TrafficMap
            reports={displayedReports}
            center={mapCenter}
            zoom={13}
            onSelectReport={(rep) => setSelectedReport(rep)}
            heightClass="h-[560px]"
          />
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4">
          {/* Selected Report Detail Card */}
          {selectedReport ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Selected Incident Detail
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedReport.roadName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedReport.locationName}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedReport.congestionLevel === 'heavy'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : selectedReport.congestionLevel === 'moderate'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedReport.congestionLevel} Congestion
                </span>
                <span className="text-xs text-slate-600 capitalize bg-slate-100 px-2.5 py-1 rounded-full">
                  {selectedReport.incidentType.replace('_', ' ')}
                </span>
              </div>

              {selectedReport.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{selectedReport.description}"
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Estimated Delay:</span>
                  <span className="font-bold text-slate-800">
                    {selectedReport.estimatedDelayMinutes || 0} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coordinates:</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Source:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedReport.isDemo ? 'Demo Baseline' : 'User Submitted'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/routes?dest=${encodeURIComponent(selectedReport.roadName)}`)}
                className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition"
              >
                Plan Route Bypassing Here →
              </button>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs text-center py-8">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-800 text-sm">No Report Selected</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Click any colored pin on the map to inspect reported congestion severity, causes, and estimated travel delay.
              </p>
            </div>
          )}

          {/* Quick Guide */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <span>💡</span> Map Navigator Tips
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>• <b>Pulsing Rings:</b> Indicate high-severity active bottlenecks reported recently.</li>
              <li>• <b>Center Button:</b> Instantly resets view to central Mira-Bhayandar.</li>
              <li>• <b>Need a Detour?</b> Go to Route Planner to compute an algorithmically recommended bypass.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
