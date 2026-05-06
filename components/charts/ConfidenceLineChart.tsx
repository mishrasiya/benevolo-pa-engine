'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface ConfidenceEntry {
  week: string;
  avgConfidence: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: '#1a2332', border: '1px solid #374151' }}>
      <p className="text-xs font-mono" style={{ color: '#6b7280' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: '#a5b4fc' }}>{payload[0].value}% avg confidence</p>
    </div>
  );
};

export default function ConfidenceLineChart({ data }: { data: ConfidenceEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" />
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
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={70} stroke="rgba(0,255,157,0.2)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="avgConfidence"
          stroke="#a5b4fc"
          strokeWidth={2}
          dot={{ fill: '#a5b4fc', r: 3 }}
          activeDot={{ r: 5, fill: '#00d4ff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
