'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DeniedEntry {
  code: string;
  desc: string;
  count: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: DeniedEntry; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  const { payload: entry, value } = payload[0];
  return (
    <div className="rounded-lg px-3 py-2 max-w-xs" style={{ background: '#1a2332', border: '1px solid #374151' }}>
      <p className="text-xs font-mono" style={{ color: '#ef4444' }}>{entry.code}</p>
      <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>{entry.desc}</p>
      <p className="text-sm font-bold" style={{ color: '#e5e7eb' }}>{value} denied</p>
    </div>
  );
};

export default function DeniedProceduresChart({ data }: { data: DeniedEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="code"
          type="category"
          tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239,68,68,0.05)' }} />
        <Bar dataKey="count" fill="#ef4444" radius={[0, 3, 3, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
