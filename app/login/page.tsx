'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials. Try provider@demo.com or admin@demo.com with password: demo');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
      <div className="w-full max-w-md px-4">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#00d4ff" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#e5e7eb' }}>
                PA Engine
              </h1>
              <p className="text-xs font-mono" style={{ color: '#00d4ff' }}>
                MEDICARE · MEDICAID
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Prior Authorization Automation Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl p-8" style={{
          background: '#111827',
          border: '1px solid #1f2937',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#e5e7eb' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1.5" style={{ color: '#9ca3af' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="provider@demo.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono transition-all"
                style={{
                  background: '#1a2332',
                  border: '1px solid #374151',
                  color: '#e5e7eb',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1.5" style={{ color: '#9ca3af' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono transition-all"
                style={{
                  background: '#1a2332',
                  border: '1px solid #374151',
                  color: '#e5e7eb',
                }}
              />
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-xs" style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all mt-2"
              style={{
                background: loading ? '#374151' : '#00d4ff',
                color: loading ? '#9ca3af' : '#0a0e1a',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #1f2937' }}>
            <p className="text-xs font-mono mb-3" style={{ color: '#6b7280' }}>
              DEMO CREDENTIALS
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { setEmail('provider@demo.com'); setPassword('demo'); }}
                className="w-full text-left px-3 py-2 rounded text-xs font-mono transition-all"
                style={{ background: '#1a2332', color: '#9ca3af' }}
              >
                <span style={{ color: '#00d4ff' }}>PROVIDER</span>{' '}
                provider@demo.com / demo
              </button>
              <button
                onClick={() => { setEmail('admin@demo.com'); setPassword('demo'); }}
                className="w-full text-left px-3 py-2 rounded text-xs font-mono transition-all"
                style={{ background: '#1a2332', color: '#9ca3af' }}
              >
                <span style={{ color: '#00ff9d' }}>ADMIN</span>{' '}
                admin@demo.com / demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
