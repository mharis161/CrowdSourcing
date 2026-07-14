import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  LayoutDashboard,
  Search,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite (same fix as MapPicker.jsx)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../utils/currency';
import { useToastStore } from '../store/useToastStore';

const QA_COLORS = {
  PASSED: '#10b981',
  FLAGGED: '#f59e0b',
  FAILED: '#ef4444',
  NOT_RUN: '#94a3b8'
};

const QA_BADGE_STYLE = {
  PASSED: 'bg-emerald-50 text-emerald-600',
  FLAGGED: 'bg-amber-50 text-amber-600',
  FAILED: 'bg-red-50 text-red-600',
  NOT_RUN: 'bg-slate-100 text-slate-500'
};

const STATUS_BADGE_STYLE = {
  IN_PROGRESS: 'bg-amber-50 text-amber-600',
  SUBMITTED: 'bg-blue-50 text-blue-600',
  APPROVED: 'bg-emerald-50 text-emerald-600',
  REJECTED: 'bg-red-50 text-red-600'
};

const extractGPS = (answer) => {
  if (!answer || typeof answer !== 'object') return null;
  if (typeof answer.latitude === 'number' && typeof answer.longitude === 'number') {
    return { lat: answer.latitude, lng: answer.longitude };
  }
  if (answer.coordinates && typeof answer.coordinates.latitude === 'number') {
    return { lat: answer.coordinates.latitude, lng: answer.coordinates.longitude };
  }
  return null;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const questionMeta = (surveyConfigJson) => {
  const map = {};
  (surveyConfigJson?.pages || []).forEach((page) => {
    (page.elements || []).forEach((el) => {
      map[el.name] = { title: el.title || el.name, type: el.type };
    });
  });
  return map;
};

const ProjectDashboard = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qaFilter, setQaFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [runningQaId, setRunningQaId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    api.get(`/tasks/${taskId}/responses`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Failed to load project dashboard:', err);
        showToast('Failed to load project data.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const titles = useMemo(() => questionMeta(data?.task?.surveyConfig), [data]);

  const qaCounts = useMemo(() => {
    const counts = { PASSED: 0, FLAGGED: 0, FAILED: 0, NOT_RUN: 0 };
    (data?.assignments || []).forEach((a) => {
      counts[a.qaStatus || 'NOT_RUN'] = (counts[a.qaStatus || 'NOT_RUN'] || 0) + 1;
    });
    return counts;
  }, [data]);

  const filteredAssignments = useMemo(() => {
    return (data?.assignments || []).filter((a) => {
      if (qaFilter !== 'ALL' && (a.qaStatus || 'NOT_RUN') !== qaFilter) return false;
      if (unitFilter !== 'ALL') {
        const gps = extractGPS(a.responseData ? Object.values(a.responseData).find(extractGPS) : null);
        if (!gps) return false;
        const unit = (data.task.locations || []).find((l) => l.locationName === unitFilter);
        if (!unit) return false;
        const dLat = gps.lat - unit.latitude;
        const dLng = gps.lng - unit.longitude;
        const approxMeters = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
        if (approxMeters > unit.radius) return false;
      }
      return true;
    });
  }, [data, qaFilter, unitFilter]);

  const handleRunQA = async (assignmentId) => {
    setRunningQaId(assignmentId);
    try {
      await api.post(`/tasks/${taskId}/assignments/${assignmentId}/run-qa`);
      showToast('QA re-run complete.', 'success');
      fetchData();
    } catch (err) {
      console.error('Run QA failed:', err);
      showToast('Failed to run QA.', 'error');
    } finally {
      setRunningQaId(null);
    }
  };

  const handleReview = async (assignmentId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/assignments/${assignmentId}/review`, { status });
      showToast(`Response ${status === 'APPROVED' ? 'approved' : 'rejected'}.`, 'success');
      fetchData();
    } catch (err) {
      console.error('Review failed:', err);
      showToast('Failed to update review status.', 'error');
    }
  };

  const mapCenter = data?.task?.locations?.[0]
    ? [data.task.locations[0].latitude, data.task.locations[0].longitude]
    : [30.3753, 69.3451];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#7f0df2] p-1.5 rounded-lg">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CrowdTask</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/dashboard/company" className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Search className="w-4 h-4" />
            Browse Tasks
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Wallet className="w-4 h-4" />
            Wallet & Payouts
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[#7f0df2] bg-purple-50 rounded-xl">
            <BarChart3 className="w-4 h-4" />
            Project Dashboard
          </button>
        </nav>
        <div className="p-4 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors mb-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard/company')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{data?.task?.title || 'Project Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-slate-400" />
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
              <User className="w-5 h-5 text-[#7f0df2]" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {loading && !data ? (
              <p className="text-sm text-slate-400 italic">Loading…</p>
            ) : !data ? (
              <p className="text-sm text-red-500">Failed to load this project.</p>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard label="Total Responses" value={data.submittedCount} icon={BarChart3} color="text-slate-900" bg="bg-slate-50" />
                  <StatCard label="QA Passed" value={qaCounts.PASSED} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
                  <StatCard label="QA Flagged" value={qaCounts.FLAGGED} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
                  <StatCard label="QA Failed" value={qaCounts.FAILED} icon={XCircle} color="text-red-600" bg="bg-red-50" />
                  <StatCard label="Budget Burned" value={formatCurrency(data.budgetBurned || 0, user?.company?.country)} icon={Wallet} color="text-[#7f0df2]" bg="bg-purple-50" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
                  <select value={qaFilter} onChange={(e) => setQaFilter(e.target.value)} className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer">
                    <option value="ALL">All QA Status</option>
                    <option value="PASSED">Passed</option>
                    <option value="FLAGGED">Flagged</option>
                    <option value="FAILED">Failed</option>
                    <option value="NOT_RUN">Not Run</option>
                  </select>
                  <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer">
                    <option value="ALL">All Units</option>
                    {(data.task.locations || []).map((loc) => (
                      <option key={loc.id} value={loc.locationName}>{loc.locationName}</option>
                    ))}
                  </select>
                </div>

                {/* Map */}
                <div className="relative h-[420px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                  <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {(data.task.locations || []).map((loc) => (
                      <React.Fragment key={loc.id}>
                        <Marker position={[loc.latitude, loc.longitude]}>
                          <Popup>{loc.locationName} (Unit, radius {loc.radius}m)</Popup>
                        </Marker>
                        <Circle center={[loc.latitude, loc.longitude]} radius={loc.radius} pathOptions={{ fillColor: '#7f0df2', color: '#7f0df2', fillOpacity: 0.05, weight: 1 }} />
                      </React.Fragment>
                    ))}
                    {filteredAssignments.map((a) => {
                      const answerWithGps = a.responseData && Object.values(a.responseData).find(extractGPS);
                      const gps = extractGPS(answerWithGps);
                      if (!gps) return null;
                      return (
                        <CircleMarker
                          key={a.id}
                          center={[gps.lat, gps.lng]}
                          radius={7}
                          pathOptions={{ color: QA_COLORS[a.qaStatus || 'NOT_RUN'], fillColor: QA_COLORS[a.qaStatus || 'NOT_RUN'], fillOpacity: 0.8, weight: 2 }}
                        >
                          <Popup>
                            <div className="text-xs font-bold">{a.participant?.name}</div>
                            <div className="text-[10px] text-slate-500">QA: {a.qaStatus || 'NOT_RUN'}</div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-4">Participant</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">QA</th>
                        <th className="px-6 py-4">Submitted</th>
                        <th className="px-6 py-4">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-xs font-bold text-slate-400 italic">No responses match these filters.</td>
                        </tr>
                      ) : (
                        filteredAssignments.map((a) => {
                          const isExpanded = expandedId === a.id;
                          const qaStatus = a.qaStatus || 'NOT_RUN';
                          const flags = a.qaFlags || [];
                          return (
                            <React.Fragment key={a.id}>
                              <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-slate-800">{a.participant?.name || 'Unknown'}</span>
                                  <span className="block text-[10px] text-slate-400">{a.participant?.email}</span>
                                </td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${STATUS_BADGE_STYLE[a.status] || 'bg-slate-100 text-slate-500'}`}>{a.status.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${QA_BADGE_STYLE[qaStatus]}`}>{qaStatus.replace('_', ' ')}</span>
                                  {flags.length > 0 && <span className="ml-2 text-[10px] text-slate-400">{flags.length} flag{flags.length === 1 ? '' : 's'}</span>}
                                </td>
                                <td className="px-6 py-4"><span className="text-xs font-bold text-slate-500">{formatRelativeTime(a.submittedAt)}</span></td>
                                <td className="px-6 py-4"><span className="text-xs font-bold text-emerald-600">{formatCurrency(a.reward, user?.company?.country)}</span></td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={5} className="px-6 py-5 bg-slate-50/50 space-y-4">
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-500">
                                      <span><span className="font-bold text-slate-700">Accepted:</span> {formatRelativeTime(a.acceptedAt)}</span>
                                      <span><span className="font-bold text-slate-700">Submitted:</span> {formatRelativeTime(a.submittedAt)}</span>
                                      <span><span className="font-bold text-slate-700">QA Run:</span> {formatRelativeTime(a.qaRunAt)}</span>
                                      {a.approvedAt && <span><span className="font-bold text-emerald-600">Approved:</span> {formatRelativeTime(a.approvedAt)}</span>}
                                      {a.rejectedAt && <span><span className="font-bold text-red-600">Rejected:</span> {formatRelativeTime(a.rejectedAt)}</span>}
                                    </div>

                                    {a.responseData ? (
                                      <div className="space-y-1">
                                        {Object.entries(a.responseData).map(([key, value]) => (
                                          <div key={key} className="text-xs">
                                            <span className="font-bold text-slate-500">{titles[key]?.title || key}: </span>
                                            <span className="font-bold text-slate-800">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs italic text-slate-400">Not submitted yet.</span>
                                    )}

                                    {a.qaSummary && (
                                      <div className="text-xs bg-white border border-slate-200 rounded-xl p-3">
                                        <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest block mb-1">AI QA Summary</span>
                                        {a.qaSummary}
                                      </div>
                                    )}
                                    {flags.length > 0 && (
                                      <div className="space-y-1">
                                        {flags.map((f, i) => (
                                          <div key={i} className="text-xs text-slate-600">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase mr-2 ${f.severity === 'high' ? 'bg-red-100 text-red-600' : f.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{f.severity || 'low'}</span>
                                            <span className="font-bold">{f.question}:</span> {f.detail}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleRunQA(a.id)}
                                        disabled={runningQaId === a.id}
                                        className="px-4 h-9 bg-white border border-slate-200 hover:border-[#7f0df2] rounded-xl text-[11px] font-bold flex items-center gap-2 disabled:opacity-50"
                                      >
                                        <RefreshCw className={`w-3.5 h-3.5 ${runningQaId === a.id ? 'animate-spin' : ''}`} />
                                        Re-run QA
                                      </button>
                                      {a.status === 'SUBMITTED' && (
                                        <>
                                          <button onClick={() => handleReview(a.id, 'APPROVED')} className="px-4 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-bold flex items-center gap-2">
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            Approve
                                          </button>
                                          <button onClick={() => handleReview(a.id, 'REJECTED')} className="px-4 h-9 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[11px] font-bold flex items-center gap-2">
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                            Reject
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

export default ProjectDashboard;
