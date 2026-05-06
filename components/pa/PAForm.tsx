'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchCodes, CodeEntry } from '@/lib/icd10';
import { PAFormData } from '@/types';

export default function PAForm() {
  const router = useRouter();
  const [form, setForm] = useState<PAFormData>({
    patientName: '',
    patientDOB: '',
    patientMemberId: '',
    diagnosisCodes: '',
    procedureCode: '',
    procedureDescription: '',
    payer: 'MEDICARE',
    urgency: 'ROUTINE',
    clinicalNotes: '',
  });

  const [icdSuggestions, setIcdSuggestions] = useState<CodeEntry[]>([]);
  const [cptSuggestions, setCptSuggestions] = useState<CodeEntry[]>([]);
  const [icdQuery, setIcdQuery] = useState('');
  const [cptQuery, setCptQuery] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleIcdSearch = useCallback((q: string) => {
    setIcdQuery(q);
    setIcdSuggestions(q.length > 1 ? searchCodes(q, 'ICD10') : []);
  }, []);

  const handleCptSearch = useCallback((q: string) => {
    setCptQuery(q);
    setCptSuggestions(q.length > 1 ? searchCodes(q, 'CPT') : []);
  }, []);

  const addIcdCode = (entry: CodeEntry) => {
    const codes = form.diagnosisCodes ? form.diagnosisCodes.split(',').map(c => c.trim()) : [];
    if (!codes.includes(entry.code)) {
      setForm(f => ({ ...f, diagnosisCodes: [...codes, entry.code].join(',') }));
    }
    setIcdQuery('');
    setIcdSuggestions([]);
  };

  const selectCptCode = (entry: CodeEntry) => {
    setForm(f => ({
      ...f,
      procedureCode: entry.code,
      procedureDescription: entry.description,
    }));
    setCptQuery(entry.code);
    setCptSuggestions([]);
  };

  const removeIcdCode = (code: string) => {
    const codes = form.diagnosisCodes.split(',').map(c => c.trim()).filter(c => c !== code);
    setForm(f => ({ ...f, diagnosisCodes: codes.join(',') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/pa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      // Auto-trigger AI analysis
      if (pdfFile) {
        const fd = new FormData();
        fd.append('pdf', pdfFile);
        await fetch(`/api/pa/${data.id}/analyze`, { method: 'POST', body: fd });
      } else {
        await fetch(`/api/pa/${data.id}/analyze`, { method: 'POST' });
      }

      router.push(`/pa/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm transition-all";
  const inputStyle = { background: '#1a2332', border: '1px solid #374151', color: '#e5e7eb' };
  const labelClass = "block text-xs font-mono mb-1.5";
  const labelStyle = { color: '#6b7280', letterSpacing: '0.06em' };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Patient Demographics */}
      <section>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e5e7eb' }}>
          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono"
            style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>1</span>
          Patient Demographics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>PATIENT NAME *</label>
            <input
              type="text" required value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              placeholder="Last, First M."
              className={inputClass} style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>DATE OF BIRTH *</label>
            <input
              type="date" required value={form.patientDOB}
              onChange={e => setForm(f => ({ ...f, patientDOB: e.target.value }))}
              className={inputClass} style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>MEMBER ID *</label>
            <input
              type="text" required value={form.patientMemberId}
              onChange={e => setForm(f => ({ ...f, patientMemberId: e.target.value }))}
              placeholder="MCR-XXXXXXX"
              className={inputClass} style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Payer & Urgency */}
      <section>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e5e7eb' }}>
          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono"
            style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>2</span>
          Payer &amp; Urgency
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>PAYER *</label>
            <select
              value={form.payer}
              onChange={e => setForm(f => ({ ...f, payer: e.target.value as 'MEDICARE' | 'MEDICAID' }))}
              className={inputClass} style={inputStyle}
            >
              <option value="MEDICARE">Medicare</option>
              <option value="MEDICAID">Medicaid</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>URGENCY *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ROUTINE', 'URGENT', 'EMERGENT'] as const).map(u => (
                <button
                  key={u} type="button"
                  onClick={() => setForm(f => ({ ...f, urgency: u }))}
                  className="py-2.5 rounded-lg text-xs font-mono font-semibold transition-all"
                  style={{
                    background: form.urgency === u
                      ? u === 'ROUTINE' ? 'rgba(0,212,255,0.15)' : u === 'URGENT' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
                      : '#1a2332',
                    color: form.urgency === u
                      ? u === 'ROUTINE' ? '#00d4ff' : u === 'URGENT' ? '#f59e0b' : '#f87171'
                      : '#6b7280',
                    border: `1px solid ${form.urgency === u
                      ? u === 'ROUTINE' ? 'rgba(0,212,255,0.3)' : u === 'URGENT' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'
                      : '#374151'}`,
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diagnosis Codes */}
      <section>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e5e7eb' }}>
          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono"
            style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>3</span>
          Diagnosis Codes (ICD-10)
        </h3>
        <div className="relative">
          <label className={labelClass} style={labelStyle}>SEARCH ICD-10 CODES</label>
          <input
            type="text" value={icdQuery}
            onChange={e => handleIcdSearch(e.target.value)}
            placeholder="Type code or description (e.g. M45.9 or ankylosing)"
            className={inputClass} style={inputStyle}
          />
          {icdSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden"
              style={{ background: '#1a2332', border: '1px solid #374151', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              {icdSuggestions.map(s => (
                <button key={s.code} type="button"
                  onClick={() => addIcdCode(s)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-all"
                  style={{ borderBottom: '1px solid #111827' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>{s.code}</span>
                  <span style={{ color: '#9ca3af' }}>{s.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {form.diagnosisCodes && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.diagnosisCodes.split(',').map(c => c.trim()).filter(Boolean).map(code => (
              <span key={code} className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                {code}
                <button type="button" onClick={() => removeIcdCode(code)} style={{ color: '#6b7280' }}>×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Procedure/Drug */}
      <section>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e5e7eb' }}>
          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono"
            style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>4</span>
          Procedure / Drug Requested
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className={labelClass} style={labelStyle}>CPT / NDC CODE *</label>
            <input
              type="text" value={cptQuery || form.procedureCode}
              onChange={e => { setCptQuery(e.target.value); handleCptSearch(e.target.value); }}
              placeholder="Search CPT/NDC code..."
              className={inputClass} style={inputStyle}
              required
            />
            {cptSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden"
                style={{ background: '#1a2332', border: '1px solid #374151', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                {cptSuggestions.map(s => (
                  <button key={s.code} type="button"
                    onClick={() => selectCptCode(s)}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-all"
                    style={{ borderBottom: '1px solid #111827' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>{s.code}</span>
                    <span className="truncate" style={{ color: '#9ca3af' }}>{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>PROCEDURE DESCRIPTION *</label>
            <input
              type="text" required value={form.procedureDescription}
              onChange={e => setForm(f => ({ ...f, procedureDescription: e.target.value }))}
              placeholder="Brief description of procedure or drug"
              className={inputClass} style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Clinical Notes */}
      <section>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e5e7eb' }}>
          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono"
            style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>5</span>
          Clinical Documentation
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>CLINICAL NOTES *</label>
            <textarea
              required value={form.clinicalNotes}
              onChange={e => setForm(f => ({ ...f, clinicalNotes: e.target.value }))}
              rows={6}
              placeholder="Document patient history, prior treatments tried and failed, current condition severity, relevant lab values, imaging findings, and medical necessity justification..."
              className={inputClass + ' resize-none'} style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
              {form.clinicalNotes.length} characters · AI performs best with 200+ characters
            </p>
          </div>

          {/* PDF Upload */}
          <div>
            <label className={labelClass} style={labelStyle}>UPLOAD CLINICAL DOCUMENTATION (PDF)</label>
            <div
              className="border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-all"
              style={{
                borderColor: pdfFile ? 'rgba(0,255,157,0.4)' : '#374151',
                background: pdfFile ? 'rgba(0,255,157,0.05)' : '#1a2332',
              }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => setPdfFile(e.target.files?.[0] || null)}
              />
              {pdfFile ? (
                <div>
                  <p className="text-sm font-mono" style={{ color: '#00ff9d' }}>{pdfFile.name}</p>
                  <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
                    {(pdfFile.size / 1024).toFixed(0)} KB · Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="#4b5563" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm" style={{ color: '#6b7280' }}>Click to upload PDF</p>
                  <p className="text-xs mt-1" style={{ color: '#4b5563' }}>Text will be extracted and added to AI context</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: submitting ? '#374151' : '#00d4ff',
            color: submitting ? '#9ca3af' : '#0a0e1a',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {submitting ? 'Submitting & Running AI Analysis...' : 'Submit PA Request + Run AI Analysis'}
        </button>
      </div>
    </form>
  );
}
