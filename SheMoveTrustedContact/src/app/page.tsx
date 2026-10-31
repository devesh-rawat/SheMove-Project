import Link from 'next/link';
import { ArrowRight, ShieldCheck, Siren } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
          SafeJourney
        </p>
        <h1 className="mt-3 text-4xl font-bold">Choose your dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Police operations and trusted-contact journey tracking are available as separate workspaces.
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
