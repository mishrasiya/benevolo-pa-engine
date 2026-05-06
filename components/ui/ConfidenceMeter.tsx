'use client';

interface ConfidenceMeterProps {
  confidence: number;
  verdict?: string | null;
  showLabel?: boolean;
}

export default function ConfidenceMeter({ confidence, verdict, showLabel = true }: ConfidenceMeterProps) {
  const pct = Math.round(confidence * 100);

  let barClass = 'confidence-bar-info';
  if (verdict === 'LIKELY_APPROVED') barClass = 'confidence-bar-approved';
  else if (verdict === 'LIKELY_DENIED') barClass = 'confidence-bar-denied';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-mono" style={{ color: '#6b7280' }}>
            AI CONFIDENCE
          </span>
          <span className="text-sm font-bold font-mono" style={{ color: '#e5e7eb' }}>
            {pct}%
          </span>
        </div>
      )}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f2937' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
