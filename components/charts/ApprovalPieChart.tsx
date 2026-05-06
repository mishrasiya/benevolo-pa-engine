'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatusBreakdown {
  APPROVED: number;
  DENIED: number;
  PENDING: number;
  APPEALED: number;
  DRAFT: number;
}

const COLORS: Record<string, string> = {
  APPROVED: '#00ff9d',
  DENIED: '#ef4444',
  PENDING: '#f59e0b',
  APPEALED: '#00d4ff',
  DRAFT: '#4b5563',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: '#1a2332', border: '1px solid #374151' }}>
      <p className="text-xs font-mono" style={{ color: COLORS[name] || '#9ca3af' }}>{name}</p>
      <p className="text-sm font-bold" style={{ color: '#e5e7eb' }}>{value}</p>
    </div>
  );
};

export default function ApprovalPieChart({ data }: { data: StatusBreakdown }) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}>
              {value}
            </span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
