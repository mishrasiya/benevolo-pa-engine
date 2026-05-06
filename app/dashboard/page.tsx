'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PATable from '@/components/pa/PATable';
import { PARequest, PAStatus, Payer, Urgency } from '@/types';

const METRIC_CARDS = [
  { key: 'total', label: 'Total Requests', color: '#00d4ff' },
  { key: 'approved', label: 'Approved', color: '#00ff9d' },
  { key: 'denied', label: 'Denied', color: '#ef4444' },
  { key: 'pending', label: 'Pending Review', color: '#f59e0b' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<PARequest[]>([]);
  const [filtered, setFiltered] = useState<PARequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayer, setFilterPayer] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterPayer) params.set('payer', filterPayer);
    if (filterUrgency) params.set('urgency', filterUrgency);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);

    try {
      const res = await fetch(`/api/pa?${params}`);
      const data = await res.json();
      setRequests(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPayer, filterUrgency, filterFrom, filterTo]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(requests); return; }
    const q = search.toLowerCase();
    setFiltered(requests.filter(r =>
      r.patientName.toLowerCase().includes(q) ||
      r.procedureCode.toLowerCase().includes(q) ||
      r.diagnosisCodes.toLowerCase().includes(q) ||
      r.patientMemberId.toLowerCase().includes(q)
    ));
  }, [search, requests]);

  const metrics = {
    total: requests.length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    denied: requests.filter(r => r.status === 'DENIED').length,
    pending: requests.filter(r => ['PENDING', 'AI_REVIEW', 'DRAFT'].includes(r.status)).length,
  };

  const withConf = requests.filter(r => r.aiConfidence != null);
  const avgConfidence = withConf.length > 0
    ? Math.round(withConf.reduce((s, r) => s + r.aiConfidence!, 0) / withConf.length * 100)
    : 0;

  const approvalRate = (metrics.approved + metrics.denied) > 0
    ? Math.round(metrics.approved / (metrics.approved + metrics.denied) * 100)
    : 0;

  const inputStyle = {
    background: '#1a2332',
    border: '1px solid #374151',
    color: '#e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    fontFamily: 'IBM Plex Mono, monospace',
  };

  if (status === 'loading') return null;

  return (
    <AppLayout>
      <div className="px-8 py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#e5e7eb' }}>PA Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
              Prior Authorization requests ·{' '}
              <span className="font-mono" style={{ color: '#9ca3af' }}>
                {session?.user?.name}
              </span>
            </p>
          </div>
          <button
            onClick={() => router.push('/pa/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#00d4ff', color: '#0a0e1a' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New PA Request
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {METRIC_CARDS.map(({ key, label, color }) => (
            <div key={key} className="col-span-1 rounded-xl p-4"
              style={{ background: '#111827', border: '1px solid #1f2937' }}>
              <p className="text-xs font-mono mb-1" style={{ color: '#4b5563', letterSpacing: '0.06em' }}>
                {label.toUpperCase()}
              </p>
              <p className="text-3xl font-bold" style={{ color }}>
                {metrics[key as keyof typeof metrics]}
              </p>
            </div>
          ))}
          <div className="col-span-1 rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1f2937' }}>
            <p className="text-xs font-mono mb-1" style={{ color: '#4b5563', letterSpacing: '0.06em' }}>APPROVAL RATE</p>
            <p className="text-3xl font-bold" style={{ color: '#00ff9d' }}>{approvalRate}%</p>
          </div>
          <div className="col-span-1 rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1f2937' }}>
            <p className="text-xs font-mono mb-1" style={{ color: '#4b5563', letterSpacing: '0.06em' }}>AVG AI CONF.</p>
            <p className="text-3xl font-bold" style={{ color: '#a5b4fc' }}>{avgConfidence}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111827', border: '1px solid #1f2937' }}>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text" placeholder="Search patient, code, member ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, minWidth: '220px', flex: 1 }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
              <option value="">All Statuses</option>
              {(['DRAFT','PENDING','AI_REVIEW','APPROVED','DENIED','APPEALED'] as PAStatus[]).map(s => (
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>
            <select value={filterPayer} onChange={e => setFilterPayer(e.target.value)} style={inputStyle}>
              <option value="">All Payers</option>
              {(['MEDICARE','MEDICAID'] as Payer[]).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} style={inputStyle}>
              <option value="">All Urgency</option>
              {(['ROUTINE','URGENT','EMERGENT'] as Urgency[]).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
              style={inputStyle} title="From date" />
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
              style={inputStyle} title="To date" />
            <button
              onClick={() => { setFilterStatus(''); setFilterPayer(''); setFilterUrgency(''); setFilterFrom(''); setFilterTo(''); setSearch(''); }}
              className="px-3 py-2 rounded-lg text-xs font-mono transition-all"
              style={{ background: '#1f2937', color: '#9ca3af' }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#111827', border: '1px solid #1f2937' }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #1f2937' }}>
            <p className="text-xs font-mono" style={{ color: '#6b7280' }}>
              {filtered.length} REQUESTS
            </p>
          </div>
          {loading ? (
            <div className="text-center py-16" style={{ color: '#4b5563' }}>
              <svg className="w-5 h-5 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#00d4ff" strokeWidth="4" />
                <path className="opacity-75" fill="#00d4ff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs font-mono">Loading...</p>
            </div>
          ) : (
            <PATable requests={filtered} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
