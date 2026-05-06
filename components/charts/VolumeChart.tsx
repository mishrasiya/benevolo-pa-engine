'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface VolumeChartProps {
  data: { week: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: '#1a2332', border: '1px solid #374151' }}>
      <p className="text-xs font-mono" style={{ color: '#6b7280' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: '#00d4ff' }}>{payload[0].value} requests</p>
    </div>
  );
};

export default function VolumeChart({ data }: VolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="week"
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
          }}
          tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
        <Bar dataKey="count" fill="#00d4ff" radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
