import { PAStatus, AIVerdict } from '@/types';

const STATUS_STYLES: Record<PAStatus, { bg: string; color: string; label: string }> = {
  DRAFT:      { bg: 'rgba(75,85,99,0.2)',    color: '#9ca3af', label: 'DRAFT' },
  PENDING:    { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'PENDING' },
  AI_REVIEW:  { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', label: 'AI REVIEW' },
  APPROVED:   { bg: 'rgba(0,255,157,0.12)',  color: '#00ff9d', label: 'APPROVED' },
  DENIED:     { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', label: 'DENIED' },
  APPEALED:   { bg: 'rgba(0,212,255,0.12)',  color: '#00d4ff', label: 'APPEALED' },
};

const VERDICT_STYLES: Record<AIVerdict, { bg: string; color: string; label: string }> = {
  LIKELY_APPROVED:  { bg: 'rgba(0,255,157,0.12)',  color: '#00ff9d', label: 'LIKELY APPROVED' },
  LIKELY_DENIED:    { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', label: 'LIKELY DENIED' },
  NEEDS_MORE_INFO:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'NEEDS INFO' },
};

export function StatusBadge({ status }: { status: PAStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="status-chip"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}
    >
      {s.label}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: AIVerdict | null | undefined }) {
  if (!verdict) return <span className="text-xs font-mono" style={{ color: '#4b5563' }}>—</span>;
  const s = VERDICT_STYLES[verdict];
  return (
    <span
      className="status-chip"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}
    >
      {s.label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    ROUTINE:  { bg: 'rgba(75,85,99,0.2)',    color: '#9ca3af' },
    URGENT:   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    EMERGENT: { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
  };
  const s = styles[urgency] || styles.ROUTINE;
  return (
    <span className="status-chip" style={{ background: s.bg, color: s.color }}>
      {urgency}
    </span>
  );
}

export function PayerBadge({ payer }: { payer: string }) {
  const isMedicare = payer === 'MEDICARE';
  return (
    <span
      className="status-chip"
      style={{
        background: isMedicare ? 'rgba(0,212,255,0.1)' : 'rgba(99,102,241,0.1)',
        color: isMedicare ? '#00d4ff' : '#a5b4fc',
      }}
    >
      {payer}
    </span>
  );
}

export function AppealStrengthBadge({ strength }: { strength: string | null | undefined }) {
  if (!strength) return null;
  const styles: Record<string, { bg: string; color: string }> = {
    STRONG:   { bg: 'rgba(0,255,157,0.12)',  color: '#00ff9d' },
    MODERATE: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    WEAK:     { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
  };
  const s = styles[strength] || styles.MODERATE;
  return (
    <span className="status-chip" style={{ background: s.bg, color: s.color }}>
      {strength}
    </span>
  );
}
