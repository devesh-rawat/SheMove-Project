import Link from 'next/link';
import { ArrowRight, ShieldCheck, Siren } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4">
          <img
            src="/app_icon_dark.png"
            alt="SheMove"
            className="w-14 h-14 rounded-2xl object-cover shadow-2xl border border-violet-500/30"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
              SheMove Platform
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Choose your dashboard</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-slate-400">
          Police operations center and trusted contact live tracking are available as dedicated real-time workspaces.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="flex min-h-64 flex-col border border-slate-700 bg-slate-900 p-6">
            <Siren className="h-7 w-7 text-rose-400" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Police dashboard</h2>
            <p className="mt-2 flex-1 text-sm text-slate-400">
              Monitor active journeys, review alerts, and coordinate response.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/police" className="inline-flex items-center gap-2 bg-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-500">
                Open dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/police/login" className="border border-slate-600 px-4 py-2 text-sm font-semibold hover:bg-slate-800">
                Officer sign-in
              </Link>
            </div>
          </section>

          <section className="flex min-h-64 flex-col border border-slate-700 bg-slate-900 p-6">
            <ShieldCheck className="h-7 w-7 text-emerald-400" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Trusted contact</h2>
            <p className="mt-2 flex-1 text-sm text-slate-400">
              Follow a shared journey, check the traveller’s status, and respond to safety alerts.
            </p>
            <Link
              href="/t/tok-priya-sharma-safe-journey-9982"
              className="mt-6 inline-flex w-fit items-center gap-2 bg-emerald-700 px-4 py-2 text-sm font-semibold hover:bg-emerald-600"
            >
              Open demo journey <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
