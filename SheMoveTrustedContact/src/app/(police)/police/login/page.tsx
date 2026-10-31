'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { DEMO_OFFICERS } from '@/lib/store';

export default function PoliceLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('police@demo.in');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (officerId?: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/police/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          officerId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store session
      if (typeof window !== 'undefined') {
        localStorage.setItem('safejourney_police_token', data.token);
        localStorage.setItem('safejourney_police_officer', JSON.stringify(data.officer));
      }

      router.push('/police');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-600 to-blue-700 shadow-xl border border-white/20 mb-3">
            <ShieldAlert className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            SafeJourney CAD
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Metropolis Police Emergency Command & Dispatch
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* 1-Click Fast Login for Hackathon Evaluator */}
          <div className="mb-5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick Demo Operator Select</span>
              <span className="text-[10px] text-amber-400 font-mono">1-Click Auth</span>
            </div>

            <div className="space-y-2">
              {DEMO_OFFICERS.map((officer) => (
                <button
                  key={officer.id}
                  type="button"
                  onClick={() => handleLogin(officer.id)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-xs">
                      {officer.badgeNumber.slice(-3)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-blue-300 transition">
                        {officer.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {officer.rank} • <span className="text-slate-300">{officer.stationName.split('-')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              Or Credentials Login
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Standard Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3.5 mt-2"
          >
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Police Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="police@demo.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Police Terminal'}</span>
            </button>
          </form>

          {/* Footer credentials reminder */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
            Default Demo: <span className="text-slate-300">police@demo.in</span> / <span className="text-slate-300">demo1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
