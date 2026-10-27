import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  Lock,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTrafficReports, updateReportReviewStatus, deleteTrafficReport } from '../lib/firestore';
import { TrafficReport } from '../types';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

export const AdminPage: React.FC = () => {
  const { currentUser, isAdmin, isFirebaseConfigured } = useAuth();
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTrafficReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleToggleReview = async (reportId: string, currentReviewed: boolean) => {
    try {
      await updateReportReviewStatus(reportId, !currentReviewed);
      setReports(reports.map((r) => (r.id === reportId ? { ...r, reviewed: !currentReviewed } : r)));
      setActionMsg(`Report review status updated to: ${!currentReviewed ? 'Reviewed' : 'Unreviewed'}.`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert(`Could not update review status: ${err.message}`);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this incident report?')) return;
    try {
      await deleteTrafficReport(reportId);
      setReports(reports.filter((r) => r.id !== reportId));
      setActionMsg('Incident report removed from database.');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert(`Could not delete report: ${err.message}`);
    }
  };

  // Guard for unauthorized users
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-md text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied: Administrator Privileges Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Administrative actions (moderating crowdsourced reports, marking records reviewed, removing spam) require server-verified administrator authorization or custom claims.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-200 text-xs text-slate-700 space-y-2">
            <span className="font-bold block text-slate-900">
              Security Architecture Notice:
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Per strict security guidelines, client-side profile tampering is rejected. To grant admin access in Firebase production:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Use Firebase Admin SDK to assign custom claims: <code>admin: true</code>.</li>
              <li>Or in Demo Mode, log in using any email containing "admin" (e.g. <code>admin@smarttraffic.local</code>).</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const reviewedCount = reports.filter((r) => r.reviewed).length;
  const pendingCount = reports.filter((r) => !r.reviewed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Incident Moderation Portal
            </h1>
            <Badge variant="indigo">Admin Authority</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review community-submitted reports, audit coordinates, verify bottlenecks, and manage spam.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Database
        </button>
      </div>

      {actionMsg && <Alert type="success">{actionMsg}</Alert>}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Reports Logged</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-xs text-amber-700 font-semibold uppercase">Pending Verification</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Reviewed & Verified</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{reviewedCount}</div>
        </div>
      </div>

      {/* Reports Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Crowdsourced Incident Logs</h3>
          <span className="text-xs text-slate-400">Owner Verification Active</span>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No incident reports registered in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Corridor & Location</th>
                  <th className="px-6 py-3">Severity / Type</th>
                  <th className="px-6 py-3">Delay</th>
                  <th className="px-6 py-3">Owner UID</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{report.roadName}</div>
                      <div className="text-[11px] text-slate-400">{report.locationName}</div>
                      {report.description && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          "{report.description}"
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            report.congestionLevel === 'heavy'
                              ? 'bg-rose-100 text-rose-800'
                              : report.congestionLevel === 'moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {report.congestionLevel}
                        </span>
                        <span className="capitalize text-slate-500 text-[11px]">
                          {report.incidentType.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      +{report.estimatedDelayMinutes || 0}m
                    </td>

                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">
                      {report.ownerUid.slice(0, 12)}...
                    </td>

                    <td className="px-6 py-3.5">
                      {report.reviewed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleReview(report.id, report.reviewed)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          report.reviewed
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                        }`}
                      >
                        {report.reviewed ? 'Mark Unreviewed' : 'Verify'}
                      </button>

                      <button
                        onClick={() => handleDelete(report.id)}
                        title="Delete Report"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
