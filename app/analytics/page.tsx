'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import dynamic from 'next/dynamic';

const VolumeChart = dynamic(() => import('@/components/charts/VolumeChart'), { ssr: false });
const ApprovalPieChart = dynamic(() => import('@/components/charts/ApprovalPieChart'), { ssr: false });
const DeniedProceduresChart = dynamic(() => import('@/components/charts/DeniedProceduresChart'), { ssr: false });
const ConfidenceLineChart = dynamic(() => import('@/components/charts/ConfidenceLineChart'), { ssr: false });

interface Analytics {
  summary: {
    total: number;
    approved: number;
    denied: number;
    pending: number;
    approvalRate: number;
    avgConfidence: number;
  };
  weeklyVolume: { week: string; count: number }[];
  statusBreakdown: {
    APPROVED: number;
    DENIED: number;
    PENDING: number;
    APPEALED: number;
    DRAFT: number;
  };
  topDenied: { code: string; desc: string; count: number }[];
  confidenceTrend: { week: string; avgConfidence: number }[];
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1f2937' }}>
      <p className="text-xs font-mono mb-2" style={{ color: '#4b5563', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p className="text-4xl font-bold mb-1" style={{ color: color || '#e5e7eb' }}>{value}</p>
      {sub && <p className="text-xs font-mono" style={{ color: '#6b7280' }}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111827', border: '1px solid #1f2937' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #1f2937' }}>
        <p className="text-xs font-mono font-semibold" style={{ color: '#9ca3af', letterSpacing: '0.06em' }}>
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#00d4ff" strokeWidth="4" />
            <path className="opacity-75" fill="#00d4ff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-8 py-7">
        <div className="mb-7">
          <h1 className="text-2xl font-bold" style={{ color: '#e5e7eb' }}>Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            PA performance metrics and trends
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          <StatCard label="TOTAL REQUESTS" value={analytics.summary.total} color="#00d4ff" />
          <StatCard label="APPROVED" value={analytics.summary.approved} color="#00ff9d" />
          <StatCard label="DENIED" value={analytics.summary.denied} color="#ef4444" />
          <StatCard label="PENDING" value={analytics.summary.pending} color="#f59e0b" />
          <StatCard
            label="APPROVAL RATE"
            value={`${analytics.summary.approvalRate}%`}
            sub="approved vs decided"
            color="#00ff9d"
          />
          <StatCard
            label="AVG AI CONFIDENCE"
            value={`${analytics.summary.avgConfidence}%`}
            sub="across analyzed PAs"
            color="#a5b4fc"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <ChartCard title="PA VOLUME BY WEEK">
            {analytics.weeklyVolume.length > 0 ? (
              <VolumeChart data={analytics.weeklyVolume} />
            ) : (
              <p className="text-xs font-mono text-center py-16" style={{ color: '#4b5563' }}>
                No data available
              </p>
            )}
          </ChartCard>

          <ChartCard title="STATUS BREAKDOWN">
            <ApprovalPieChart data={analytics.statusBreakdown} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ChartCard title="TOP DENIED PROCEDURES">
            {analytics.topDenied.length > 0 ? (
              <DeniedProceduresChart data={analytics.topDenied} />
            ) : (
              <p className="text-xs font-mono text-center py-16" style={{ color: '#4b5563' }}>
                No denied procedures
              </p>
            )}
          </ChartCard>

          <ChartCard title="AVG AI CONFIDENCE TREND">
            {analytics.confidenceTrend.length > 0 ? (
              <ConfidenceLineChart data={analytics.confidenceTrend} />
            ) : (
              <p className="text-xs font-mono text-center py-16" style={{ color: '#4b5563' }}>
                No confidence data yet
              </p>
            )}
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
