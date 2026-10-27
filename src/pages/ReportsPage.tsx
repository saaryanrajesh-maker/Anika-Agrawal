import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Eye,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { getTrafficReports, resetDemoData } from '../lib/firestore';
import { TrafficReport, CongestionLevel, IncidentType } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Link } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | CongestionLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | IncidentType>('all');
  const [selectedReport, setSelectedReport] = useState<TrafficReport | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getTrafficReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const roadMatch = r.roadName.toLowerCase().includes(q);
        const locMatch = r.locationName?.toLowerCase().includes(q);
        const descMatch = r.description?.toLowerCase().includes(q);
        if (!roadMatch && !locMatch && !descMatch) return false;
      }
      // Severity filter
      if (severityFilter !== 'all' && r.congestionLevel !== severityFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && r.incidentType !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [reports, search, severityFilter, typeFilter]);

  const handleResetDemoData = () => {
    resetDemoData();
    loadReports();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Traffic Reports Directory
            </h1>
            <Badge variant="blue">{filteredReports.length} Active</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, and inspect crowdsourced traffic incident records across urban corridors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleResetDemoData}
            title="Reset demonstration records"
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition"
          >
            Reset Demo Dataset
          </button>
          <Link
            to="/report"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            File New Report
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by road name, landmark or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Severity Filter */}
          <div className="md:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Congestion Levels</option>
              <option value="heavy">Heavy Congestion Only</option>
              <option value="moderate">Moderate Slowdown Only</option>
              <option value="low">Low / Free Flow Only</option>
            </select>
          </div>

          {/* Incident Type Filter */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Incident Types</option>
              <option value="congestion">Traffic Congestion</option>
              <option value="roadwork">Roadwork / Construction</option>
              <option value="accident">Accidents</option>
              <option value="road_closure">Road Closures</option>
              <option value="other">Other Obstructions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => {
            const isHeavy = report.congestionLevel === 'heavy';
            const isModerate = report.congestionLevel === 'moderate';

            return (
              <div
                key={report.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        isHeavy
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isModerate
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isHeavy ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      {report.congestionLevel}
                    </span>

                    {report.isDemo || report.source === 'demo_data' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Demo Data
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        User Report
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                    {report.roadName}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{report.locationName || 'Mira-Bhayandar'}</span>
                  </div>

                  {report.description && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{report.description}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>+{report.estimatedDelayMinutes || 0}m delay</span>
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title="Incident Report Details"
        >
          <div className="space-y-4 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Road / Corridor
              </div>
              <div className="text-base font-bold text-slate-900">{selectedReport.roadName}</div>
              <div className="text-slate-500 text-xs mt-0.5">{selectedReport.locationName}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block mb-0.5">Congestion Severity</span>
                <span className="font-bold uppercase text-slate-900">
                  {selectedReport.congestionLevel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Incident Type</span>
                <span className="font-bold capitalize text-slate-900">
                  {selectedReport.incidentType.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Estimated Delay</span>
                <span className="font-bold text-slate-900">
                  {selectedReport.estimatedDelayMinutes || 0} minutes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Report Source</span>
                <span className="font-bold text-slate-900">
                  {selectedReport.isDemo ? 'Baseline Demo Dataset' : 'User Submitted'}
                </span>
              </div>
            </div>

            {selectedReport.description && (
              <div>
                <span className="text-slate-400 block mb-1">Detailed Description</span>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                  {selectedReport.description}
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-100">
              <div>Coordinates: {selectedReport.latitude}, {selectedReport.longitude}</div>
              <div>Submitted at: {new Date(selectedReport.createdAt).toLocaleString()}</div>
              <div>Report Owner ID: {selectedReport.ownerUid}</div>
            </div>

            <div className="pt-2">
              <Link
                to={`/routes?dest=${encodeURIComponent(selectedReport.roadName)}`}
                className="w-full block text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
              >
                Plan Route Bypassing This Road →
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
