'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PARequest } from '@/types';
import { StatusBadge, VerdictBadge, PayerBadge, UrgencyBadge } from '@/components/ui/StatusBadge';
import ConfidenceMeter from '@/components/ui/ConfidenceMeter';

interface PATableProps {
  requests: PARequest[];
}

export default function PATable({ requests }: PATableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof PARequest>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function handleSort(field: keyof PARequest) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  const sorted = [...requests].sort((a, b) => {
    const av = a[sortField] as string;
    const bv = b[sortField] as string;
    return sortDir === 'asc'
      ? String(av ?? '').localeCompare(String(bv ?? ''))
      : String(bv ?? '').localeCompare(String(av ?? ''));
  });

  const SortIcon = ({ field }: { field: keyof PARequest }) => (
    <svg
      className="w-3 h-3 inline ml-1"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      style={{ opacity: sortField === field ? 1 : 0.3 }}
    >
      {sortField === field && sortDir === 'asc'
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      }
    </svg>
  );

  if (requests.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: '#4b5563' }}>
        <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        <p className="text-sm font-mono">No PA requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #1f2937' }}>
            {[
              { label: 'PATIENT', field: 'patientName' as keyof PARequest },
              { label: 'PROCEDURE', field: 'procedureCode' as keyof PARequest },
              { label: 'PAYER', field: 'payer' as keyof PARequest },
              { label: 'URGENCY', field: 'urgency' as keyof PARequest },
              { label: 'STATUS', field: 'status' as keyof PARequest },
              { label: 'AI VERDICT', field: 'aiVerdict' as keyof PARequest },
              { label: 'CONFIDENCE', field: 'aiConfidence' as keyof PARequest },
              { label: 'TURNAROUND', field: 'turnaroundEstimate' as keyof PARequest },
              { label: 'SUBMITTED', field: 'createdAt' as keyof PARequest },
            ].map(({ label, field }) => (
              <th
                key={field}
                className="text-left px-4 py-3 text-xs font-mono cursor-pointer select-none"
                style={{ color: '#6b7280', letterSpacing: '0.06em' }}
                onClick={() => handleSort(field)}
              >
                {label}
                <SortIcon field={field} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((pa) => (
            <tr
              key={pa.id}
              className="table-row-hover transition-colors"
              style={{ borderBottom: '1px solid #111827' }}
              onClick={() => router.push(`/pa/${pa.id}`)}
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium" style={{ color: '#e5e7eb' }}>{pa.patientName}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: '#4b5563' }}>
                    {pa.patientMemberId}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-mono text-xs font-semibold" style={{ color: '#00d4ff' }}>
                    {pa.procedureCode}
                  </p>
                  <p className="text-xs mt-0.5 max-w-[180px] truncate" style={{ color: '#6b7280' }}>
                    {pa.procedureDescription}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <PayerBadge payer={pa.payer} />
              </td>
              <td className="px-4 py-3">
                <UrgencyBadge urgency={pa.urgency} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={pa.status} />
              </td>
              <td className="px-4 py-3">
                <VerdictBadge verdict={pa.aiVerdict} />
              </td>
              <td className="px-4 py-3" style={{ minWidth: '120px' }}>
                {pa.aiConfidence != null ? (
                  <ConfidenceMeter
                    confidence={pa.aiConfidence}
                    verdict={pa.aiVerdict}
                    showLabel={false}
                  />
                ) : (
                  <span className="text-xs font-mono" style={{ color: '#4b5563' }}>—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>
                  {pa.turnaroundEstimate || '—'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-mono" style={{ color: '#6b7280' }}>
                  {new Date(pa.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
