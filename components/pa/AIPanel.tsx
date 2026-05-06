'use client';

import { PARequest, AIVerdict } from '@/types';
import { VerdictBadge, AppealStrengthBadge } from '@/components/ui/StatusBadge';
import ConfidenceMeter from '@/components/ui/ConfidenceMeter';

interface AIPanelProps {
  pa: PARequest;
}

export default function AIPanel({ pa }: AIPanelProps) {
  const rationale: string[] = pa.aiRationale ? JSON.parse(pa.aiRationale) : [];
  const docGaps: string[] = pa.aiDocGaps ? JSON.parse(pa.aiDocGaps) : [];
  const suggestedCodes: { code: string; description: string }[] = pa.aiSuggestedCodes
    ? JSON.parse(pa.aiSuggestedCodes)
    : [];

  const hasAnalysis = pa.aiVerdict !== null && pa.aiVerdict !== undefined;

  if (!hasAnalysis) {
    return (
      <div className="rounded-xl p-6 text-center ai-glow"
        style={{ background: '#111827', border: '1px solid #1f2937' }}>
        <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.1)' }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#00d4ff" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <p className="text-sm font-mono mb-1" style={{ color: '#9ca3af' }}>
          AI ANALYSIS PENDING
        </p>
        <p className="text-xs" style={{ color: '#4b5563' }}>
          Run AI analysis to get clinical decision support
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden ai-glow"
      style={{ border: '1px solid rgba(0,212,255,0.2)' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'rgba(0,212,255,0.05)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#00d4ff" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-xs font-mono font-semibold" style={{ color: '#00d4ff', letterSpacing: '0.08em' }}>
            AI CLINICAL ANALYSIS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AppealStrengthBadge strength={pa.appealStrength} />
          <VerdictBadge verdict={pa.aiVerdict as AIVerdict} />
        </div>
      </div>

      <div className="p-5 space-y-5" style={{ background: '#111827' }}>
        {/* Confidence Meter */}
        {pa.aiConfidence != null && (
          <ConfidenceMeter confidence={pa.aiConfidence} verdict={pa.aiVerdict} />
        )}

        {/* Summary */}
        {pa.aiSummary && (
          <div className="rounded-lg px-4 py-3" style={{ background: '#1a2332', border: '1px solid #1f2937' }}>
            <p className="text-xs font-mono mb-1" style={{ color: '#6b7280' }}>PROVIDER SUMMARY</p>
            <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{pa.aiSummary}</p>
          </div>
        )}

        {/* Rationale */}
        {rationale.length > 0 && (
          <div>
            <p className="text-xs font-mono mb-2" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
              CLINICAL RATIONALE
            </p>
            <ul className="space-y-1.5">
              {rationale.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#9ca3af' }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#00d4ff' }} />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Documentation Gaps */}
        {docGaps.length > 0 && (
          <div className="rounded-lg p-4" style={{
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid rgba(245,158,11,0.2)'
          }}>
            <p className="text-xs font-mono mb-2" style={{ color: '#f59e0b', letterSpacing: '0.06em' }}>
              DOCUMENTATION GAPS
            </p>
            <ul className="space-y-1.5">
              {docGaps.map((g, i) => (
                <li key={i} className="flex gap-2.5 text-sm" style={{ color: '#fcd34d' }}>
                  <span className="mt-1.5 flex-shrink-0" style={{ color: '#f59e0b' }}>!</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Codes */}
        {suggestedCodes.length > 0 && (
          <div>
            <p className="text-xs font-mono mb-2" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
              SUGGESTED ICD-10 CODES
            </p>
            <div className="space-y-1.5">
              {suggestedCodes.map((sc, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    {sc.code}
                  </span>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>{sc.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turnaround */}
        {pa.turnaroundEstimate && (
          <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid #1f2937' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs" style={{ color: '#6b7280' }}>Estimated turnaround:</span>
            <span className="text-xs font-mono font-semibold" style={{ color: '#9ca3af' }}>
              {pa.turnaroundEstimate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
