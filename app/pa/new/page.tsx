'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PAForm from '@/components/pa/PAForm';

export default function NewPAPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return null;

  return (
    <AppLayout>
      <div className="px-8 py-7 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm mb-4 transition-all"
            style={{ color: '#6b7280' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold" style={{ color: '#e5e7eb' }}>
            New Prior Authorization Request
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Complete all required fields. AI clinical analysis runs automatically on submission.
          </p>
        </div>

        {/* AI info banner */}
        <div className="rounded-xl px-5 py-4 mb-8 flex items-start gap-3"
          style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="#00d4ff" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#00d4ff' }}>
              AI Clinical Reviewer Active
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
              Claude AI will analyze this request against CMS LCD/NCD guidelines and provide
              approval likelihood, documentation gaps, and suggested codes within seconds.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl p-7" style={{ background: '#111827', border: '1px solid #1f2937' }}>
          <PAForm />
        </div>
      </div>
    </AppLayout>
  );
}
