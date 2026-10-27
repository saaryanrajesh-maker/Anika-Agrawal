import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Car,
  AlertCircle,
  Clock,
  TrendingUp,
  MapPin,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Database,
  Filter,
} from 'lucide-react';
import { getTrafficReports } from '../lib/firestore';
import { TrafficReport } from '../types';
import { TrafficMap } from '../components/map/TrafficMap';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { isFirebaseConfigured } = useAuth();
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'user' | 'demo'>('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getTrafficReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (selectedFilter === 'user') {
      return reports.filter((r) => !r.isDemo && r.source !== 'demo_data');
    }
    if (selectedFilter === 'demo') {
      return reports.filter((r) => r.isDemo || r.source === 'demo_data');
    }
    return reports;
  }, [reports, selectedFilter]);

  // Statistics
  const totalCount = filteredReports.length;
  const heavyCount = filteredReports.filter((r) => r.congestionLevel === 'heavy').length;
  const moderateCount = filteredReports.filter((r) => r.congestionLevel === 'moderate').length;
  const lowCount = filteredReports.filter((r) => r.congestionLevel === 'low').length;

  const totalDelays = filteredReports.reduce((acc, r) => acc + (r.estimatedDelayMinutes || 0), 0);
  const avgDelay = totalCount > 0 ? Math.round(totalDelays / totalCount) : 0;

  // Chart data: Distribution by Congestion Severity
  const severityChartData = [
    { name: 'Low Congestion', value: lowCount, color: '#10b981' },
    { name: 'Moderate Traffic', value: moderateCount, color: '#f59e0b' },
    { name: 'Heavy Gridlock', value: heavyCount, color: '#ef4444' },
  ];

  // Incident type breakdown
  const incidentChartData = useMemo(() => {
    const counts: Record<string, number> = {
      congestion: 0,
      roadwork: 0,
      accident: 0,
      road_closure: 0,
      other: 0,
    };
    filteredReports.forEach((r) => {
      const type = r.incidentType || 'congestion';
      counts[type] = (counts[type] || 0) + 1;
    });

    return [
      { name: 'Congestion', count: counts.congestion },
      { name: 'Roadwork', count: counts.roadwork },
      { name: 'Accidents', count: counts.accident },
      { name: 'Closure', count: counts.road_closure },
      { name: 'Other', count: counts.other },
    ];
  }, [filteredReports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              City Congestion Dashboard
            </h1>
            <Badge variant="blue">Mira-Bhayandar</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time aggregate road condition indicators, incident distributions, and active urban bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={fetchReports}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/report"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Submit Report
          </Link>
        </div>
      </div>

      {/* Dataset Source Filter Notice */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-900 block">
              {isFirebaseConfigured
                ? 'Cloud Firestore Live Database Connected'
                : 'Prototype Demonstration Dataset Active'}
            </span>
            <span className="text-slate-500">
              {isFirebaseConfigured
                ? 'Displaying reports stored in your production Firebase Firestore project.'
                : 'Using realistic Mira-Bhayandar baseline testbed dataset with local storage simulation.'}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-end md:self-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setSelectedFilter('demo')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'demo'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demo Records
          </button>
          <button
            onClick={() => setSelectedFilter('user')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedFilter === 'user'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User Reports
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Reports</span>
            <Car className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across Mira-Bhayandar</div>
        </div>

        {/* Heavy Congestion */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/90 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-500 text-xs font-medium mb-2">
            <span>Heavy Gridlock</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{heavyCount}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">Requires alternative bypass</div>
        </div>

        {/* Moderate Traffic */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/90 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium mb-2">
            <span>Moderate Slowdown</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{moderateCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">Slow moving traffic</div>
        </div>

        {/* Low Congestion */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium mb-2">
            <span>Free Flow</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{lowCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Optimal travel speeds</div>
        </div>

        {/* Average Delay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Avg Est. Delay</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgDelay} min</div>
          <div className="text-[11px] text-slate-500 mt-1">Reported bottleneck delay</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Congestion Severity Distribution
            </h3>
            <span className="text-xs text-slate-500">Live Breakdown</span>
          </div>

          <div className="h-64 w-full">
            {totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    label={(entry) => `${entry.value}`}
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No reports recorded in this filter view.
              </div>
            )}
          </div>
        </div>

        {/* Incident Type Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Incident Category Breakdown</h3>
            <span className="text-xs text-slate-500">ByType</span>
          </div>

          <div className="h-64 w-full">
            {totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No incidents reported.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Road Incident Locations Map
            </h3>
            <p className="text-xs text-slate-500">
              Interactive Leaflet visualization of reported bottlenecks across Mira-Bhayandar.
            </p>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            Open Fullscreen Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TrafficMap reports={filteredReports} heightClass="h-[420px]" />
      </div>

      {/* Recent Traffic Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Incident Reports</h3>
            <p className="text-xs text-slate-500">Chronological feed of road conditions</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            View All Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No incident reports found. Submit the first report above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Road / Corridor</th>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Incident Type</th>
                  <th className="px-6 py-3">Est. Delay</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.slice(0, 6).map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      <div>{report.roadName}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                        {report.locationName || 'Mira-Bhayandar, MH'}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          report.congestionLevel === 'heavy'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : report.congestionLevel === 'moderate'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {report.congestionLevel}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 capitalize text-slate-600">
                      {report.incidentType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {report.estimatedDelayMinutes ? `${report.estimatedDelayMinutes} min` : 'None'}
                    </td>
                    <td className="px-6 py-3.5">
                      {report.isDemo || report.source === 'demo_data' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Demo Data
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          User Report
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-400">
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
