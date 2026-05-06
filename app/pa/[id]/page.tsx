'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import AIPanel from '@/components/pa/AIPanel';
import AppealModal from '@/components/pa/AppealModal';
import { StatusBadge, PayerBadge, UrgencyBadge } from '@/components/ui/StatusBadge';
import { PARequest, AuditEntry, ProviderNote } from '@/types';

export default function PADetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pa, setPa] = useState<PARequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealLetter, setAppealLetter] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchPA = async () => {
    try {
      const res = await fetch(`/api/pa/${id}`);
      if (!res.ok) { router.push('/dashboard'); return; }
      const data = await res.json();
      setPa(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPA(); }, [id]);

  const runAnalysis = async () => {
    if (!pa) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/pa/${id}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setPa(data);
    } finally {
      setAnalyzing(false);
      fetchPA();
    }
  };

  const updateStatus = async (newStatus: string, action: string, details?: string) => {
    setActionLoading(newStatus);
    try {
      const res = await fetch(`/api/pa/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, action, details }),
      });
      if (res.ok) await fetchPA();
    } finally {
      setActionLoading('');
    }
  };

  const addNote = async () => {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/pa/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent }),
      });
      if (res.ok) {
        setNoteContent('');
        await fetchPA();
      }
    } finally {
      setAddingNote(false);
    }
  };

  if (loading || !pa) {
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

  const auditLog: AuditEntry[] = pa.auditLog || [];
  const notes: ProviderNote[] = pa.notes || [];

  return (
    <AppLayout>
      <div className="px-8 py-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-sm mb-3 transition-all"
              style={{ color: '#6b7280' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ color: '#e5e7eb' }}>{pa.patientName}</h1>
              <StatusBadge status={pa.status} />
              <PayerBadge payer={pa.payer} />
              <UrgencyBadge urgency={pa.urgency} />
            </div>
            <p className="text-sm mt-1 font-mono" style={{ color: '#4b5563' }}>
              {pa.patientMemberId} · DOB: {pa.patientDOB} ·{' '}
              <span style={{ color: '#00d4ff' }}>{pa.procedureCode}</span>
              {' '}{pa.procedureDescription}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap justify-end">
            {!pa.aiVerdict && (
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: analyzing ? '#374151' : 'rgba(0,212,255,0.15)',
                  color: analyzing ? '#6b7280' : '#00d4ff',
                  border: '1px solid rgba(0,212,255,0.3)',
                }}
              >
                {analyzing && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            )}
            {pa.status !== 'APPROVED' && (
              <button
                onClick={() => updateStatus('APPROVED', 'APPROVED', 'Marked approved by provider')}
                disabled={!!actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(0,255,157,0.1)', color: '#00ff9d', border: '1px solid rgba(0,255,157,0.2)' }}
              >
                Mark Approved
              </button>
            )}
            {pa.status !== 'DENIED' && (
              <button
                onClick={() => updateStatus('DENIED', 'DENIED', 'Marked denied by provider')}
                disabled={!!actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Mark Denied
              </button>
            )}
            {(pa.status === 'DENIED') && (
              <button
                onClick={() => setShowAppeal(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}
              >
                Initiate Appeal
              </button>
            )}
            {pa.status === 'PENDING' && (
              <button
                onClick={() => updateStatus('PENDING', 'SUBMITTED_TO_PAYER', 'Submitted to payer')}
                disabled={!!actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#00d4ff', color: '#0a0e1a' }}
              >
                Submit to Payer
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Info + Notes */}
          <div className="col-span-2 space-y-5">

            {/* Patient & Request Info */}
            <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1f2937' }}>
              <h3 className="text-xs font-mono mb-4" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                REQUEST DETAILS
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                {[
                  { label: 'PATIENT', value: pa.patientName },
                  { label: 'DATE OF BIRTH', value: pa.patientDOB },
                  { label: 'MEMBER ID', value: pa.patientMemberId },
                  { label: 'DIAGNOSIS CODES', value: pa.diagnosisCodes },
                  { label: 'PROCEDURE CODE', value: pa.procedureCode },
                  { label: 'PROCEDURE', value: pa.procedureDescription },
                  { label: 'PAYER', value: pa.payer },
                  { label: 'URGENCY', value: pa.urgency },
                  { label: 'SUBMITTED', value: new Date(pa.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-mono mb-0.5" style={{ color: '#4b5563' }}>{label}</p>
                    <p className="font-mono text-xs" style={{ color: '#e5e7eb' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-mono mb-2" style={{ color: '#4b5563' }}>CLINICAL NOTES</p>
                <div className="rounded-lg px-4 py-3 text-sm leading-relaxed"
                  style={{ background: '#1a2332', color: '#9ca3af', border: '1px solid #1f2937' }}>
                  {pa.clinicalNotes}
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1f2937' }}>
              <h3 className="text-xs font-mono mb-4" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                AUDIT TIMELINE
              </h3>
              <div className="space-y-3">
                {auditLog.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: '#00d4ff' }} />
                      {i < auditLog.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: '#1f2937' }} />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold" style={{ color: '#e5e7eb' }}>
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono" style={{ color: '#4b5563' }}>
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        by {entry.performedBy}
                        {entry.details && ` · ${entry.details}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Notes */}
            <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #1f2937' }}>
              <h3 className="text-xs font-mono mb-4" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                PROVIDER NOTES
              </h3>
              {notes.length === 0 && (
                <p className="text-xs font-mono mb-4" style={{ color: '#4b5563' }}>No notes yet.</p>
              )}
              <div className="space-y-3 mb-4">
                {notes.map(note => (
                  <div key={note.id} className="rounded-lg px-4 py-3"
                    style={{ background: '#1a2332', border: '1px solid #1f2937' }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
                        {note.author?.name}
                      </span>
                      <span className="text-xs font-mono" style={{ color: '#4b5563' }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#d1d5db' }}>{note.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  rows={2}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm resize-none"
                  style={{ background: '#1a2332', border: '1px solid #374151', color: '#e5e7eb' }}
                />
                <button
                  onClick={addNote}
                  disabled={addingNote || !noteContent.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold self-end"
                  style={{
                    background: addingNote || !noteContent.trim() ? '#374151' : '#00d4ff',
                    color: addingNote || !noteContent.trim() ? '#6b7280' : '#0a0e1a',
                  }}
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI Panel */}
          <div className="col-span-1">
            <AIPanel pa={pa} />
          </div>
        </div>
      </div>

      {/* Appeal Letter View */}
      {appealLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl rounded-xl overflow-hidden"
            style={{ background: '#111827', border: '1px solid #1f2937' }}>
            <div className="px-6 py-4 flex justify-between items-center"
              style={{ borderBottom: '1px solid #1f2937' }}>
              <h2 className="font-semibold" style={{ color: '#e5e7eb' }}>Appeal Letter Draft</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(appealLetter)}
                  className="px-3 py-1.5 rounded text-xs font-mono"
                  style={{ background: '#1f2937', color: '#9ca3af' }}
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([appealLetter], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `appeal-${pa.patientName.replace(' ','-')}.txt`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded text-xs font-mono"
                  style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}
                >
                  Download .txt
                </button>
                <button onClick={() => setAppealLetter('')}
                  className="p-1 rounded" style={{ color: '#6b7280' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed"
                style={{ color: '#d1d5db' }}>
                {appealLetter}
              </pre>
            </div>
          </div>
        </div>
      )}

      {showAppeal && (
        <AppealModal
          paId={id}
          patientName={pa.patientName}
          procedureCode={pa.procedureCode}
          onClose={() => setShowAppeal(false)}
          onSuccess={(letter) => {
            setShowAppeal(false);
            setAppealLetter(letter);
            fetchPA();
          }}
        />
      )}
    </AppLayout>
  );
}
