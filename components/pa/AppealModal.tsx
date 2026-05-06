'use client';

import { useState } from 'react';

const COMMON_DENIAL_REASONS = [
  'Not medically necessary per plan criteria',
  'Step therapy requirements not met',
  'Prior authorization not obtained',
  'Experimental or investigational procedure',
  'Lack of sufficient clinical documentation',
  'Duplicate claim or service',
  'Not a covered benefit under plan',
  'Out-of-network provider without authorization',
  'Diagnosis does not support requested procedure',
  'Frequency/quantity limits exceeded',
];

interface AppealModalProps {
  paId: string;
  patientName: string;
  procedureCode: string;
  onClose: () => void;
  onSuccess: (letter: string) => void;
}

export default function AppealModal({
  paId,
  patientName,
  procedureCode,
  onClose,
  onSuccess,
}: AppealModalProps) {
  const [denialReason, setDenialReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalReason = denialReason === 'custom' ? customReason : denialReason;

  const handleGenerate = async () => {
    if (!finalReason.trim()) {
      setError('Please provide or select a denial reason');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/pa/${paId}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denialReason: finalReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate appeal');
      onSuccess(data.letter);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ background: '#111827', border: '1px solid #1f2937' }}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #1f2937' }}>
          <div>
            <h2 className="font-semibold" style={{ color: '#e5e7eb' }}>Appeal Assistant</h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#6b7280' }}>
              {patientName} · {procedureCode}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded" style={{ color: '#6b7280' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Select or enter the denial reason to generate a CMS-formatted appeal letter.
          </p>

          <div>
            <label className="block text-xs font-mono mb-1.5" style={{ color: '#6b7280' }}>
              DENIAL REASON
            </label>
            <select
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: '#1a2332', border: '1px solid #374151', color: '#e5e7eb' }}
            >
              <option value="">Select a reason...</option>
              {COMMON_DENIAL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="custom">Custom reason...</option>
            </select>
          </div>

          {denialReason === 'custom' && (
            <div>
              <label className="block text-xs font-mono mb-1.5" style={{ color: '#6b7280' }}>
                CUSTOM DENIAL REASON
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                placeholder="Enter the specific denial reason from the EOB or denial letter..."
                className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                style={{ background: '#1a2332', border: '1px solid #374151', color: '#e5e7eb' }}
              />
            </div>
          )}

          {error && (
            <div className="rounded px-3 py-2 text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <div className="rounded-lg px-4 py-3 text-xs" style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.15)',
            color: '#6b7280'
          }}>
            Claude AI will draft a formal appeal letter using the original clinical notes,
            AI analysis findings, and CMS appeal guidelines.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: '1px solid #1f2937' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: '#1f2937', color: '#9ca3af' }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !finalReason.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{
              background: loading || !finalReason.trim() ? '#374151' : '#00d4ff',
              color: loading || !finalReason.trim() ? '#6b7280' : '#0a0e1a',
              cursor: loading || !finalReason.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Generating...' : 'Generate Appeal Letter'}
          </button>
        </div>
      </div>
    </div>
  );
}
