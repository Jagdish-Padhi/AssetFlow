import { Link } from 'react-router-dom';
import { Package, CalendarCheck, Wrench, FileSearch, ShieldCheck, Activity, Users, Building, ArrowRight, Globe, ExternalLink } from 'lucide-react';

const FEATURES = [
  { icon: <Package className="h-8 w-8 text-[var(--app-color-primary)]" />, title: 'Asset Lifecycle Registry', desc: 'Centralized directory tracking assets through structured states: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, and Disposed.' },
  { icon: <Users className="h-8 w-8 text-[var(--app-color-primary)]" />, title: 'Conflict-Free Allocations', desc: 'Prevent double-allocation of hardware through a strict check-out engine. Handshake active assets between users with secure transfer requests.' },
  { icon: <CalendarCheck className="h-8 w-8 text-[var(--app-color-primary)]" />, title: 'Resource Scheduling Engine', desc: 'Time-slot booking calendar for shared equipment and facilities featuring real-time overlap validation and instant scheduling visualizers.' },
  { icon: <Wrench className="h-8 w-8 text-[var(--app-color-primary)]" />, title: 'Maintenance Workflows', desc: 'Submit and approve work orders. Automatically transitions assets to "Under Maintenance" on approval and reverts to "Available" on resolution.' },
  { icon: <FileSearch className="h-8 w-8 text-[var(--app-color-primary)]" />, title: 'Operational Audits', desc: 'Run structured department inventory verifications. Generate discrepancy reports, lock cycles, and transition missing assets to "Lost" status.' },
  { icon: <Activity className="h-8 w-8 text-[var(--app-color-primary)]" />, title: 'Corporate Analytics', desc: 'Trace asset utilization rates, maintenance frequency, and department allocations. Export print-ready executive PDF summaries or CSV files.' },
];

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Setup Hierarchy',
    desc: 'Map organizational departments and asset categories to configure validation and access parameters.',
    icon: <Building className="h-5 w-5 text-[var(--app-color-primary)]" />
  },
  {
    step: '02',
    title: 'Register Inventory',
    desc: 'Onboard physical capital assets with unique tracking tags and category-specific custom specifications.',
    icon: <Package className="h-5 w-5 text-[var(--app-color-primary)]" />
  },
  {
    step: '03',
    title: 'Deploy & Schedule',
    desc: 'Allocate items directly to employees or reserve shared facilities via visual scheduling calendars.',
    icon: <CalendarCheck className="h-5 w-5 text-[var(--app-color-primary)]" />
  },
  {
    step: '04',
    title: 'Audit & Maintain',
    desc: 'Execute verification cycles to reconcile missing items and route repair approvals to technicians.',
    icon: <Wrench className="h-5 w-5 text-[var(--app-color-primary)]" />
  }
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* Aurora background blobs */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-16 border-b border-[var(--app-color-border)]/40 bg-white/30 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-color-primary)] text-white shadow-md">
            <Package className="h-5 w-5" />
          </span>
          <span className="text-base font-black uppercase tracking-widest text-[var(--app-color-text)]">
            AssetFlow
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--app-color-text)] hover:bg-white/60 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-[var(--app-color-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--app-color-primary-hover)] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center lg:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--app-color-border)] bg-white/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-color-primary)] shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-color-primary)] animate-pulse" />
          Enterprise Asset Flow ERP
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[1.15] tracking-tight text-[var(--app-color-text)] sm:text-5xl lg:text-6xl">
          Centralized Operations for <br />
          <span className="text-[var(--app-color-primary)]">Corporate Asset Management</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base text-[var(--app-color-text-muted)] leading-relaxed">
          Simplify how your organization tracks physical capital, schedules shared spaces, and approves maintenance logs. A unified ERP engine built for conflict-free resource allocation.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/register" className="w-full sm:w-auto rounded-xl bg-[var(--app-color-primary)] px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[var(--app-color-primary-hover)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
            Launch Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto rounded-xl border border-[var(--app-color-border)] bg-white/70 px-6 py-3.5 text-xs font-bold text-[var(--app-color-text)] backdrop-blur hover:bg-white transition-colors">
            Access System
          </Link>
        </div>
      </section>

      {/* ── System Management Flow (NEW SECTION) ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black tracking-tight text-[var(--app-color-text)]">
            Overall System Operational Flow
          </h2>
          <p className="text-xs text-[var(--app-color-text-muted)] mt-1.5">
            How physical assets and shared resources route through the lifecycle pipeline.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {FLOW_STEPS.map((item, idx) => (
            <div key={idx} className="relative rounded-2xl border border-[var(--app-color-border)] bg-white/50 p-5 backdrop-blur-sm shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80">
                  {item.icon}
                </span>
                <span className="text-xs font-mono font-black text-slate-300">{item.step}</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--app-color-text)] mb-2">{item.title}</h3>
              <p className="text-[11px] text-[var(--app-color-text-muted)] leading-relaxed flex-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enterprise Modules Grid ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 border-t border-[var(--app-color-border)]/40 pt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black tracking-tight text-[var(--app-color-text)]">
            Complete Operations Coverage
          </h2>
          <p className="text-xs text-[var(--app-color-text-muted)] mt-1.5">
            Everything required to manage lifecycle tracking, scheduling coordination, and audits.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-[var(--app-color-border)] bg-white/80 p-6 backdrop-blur shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="mb-4">{feat.icon}</div>
              <h3 className="mb-2 text-sm font-bold text-[var(--app-color-text)]">{feat.title}</h3>
              <p className="text-[11px] text-[var(--app-color-text-muted)] leading-relaxed flex-1">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[var(--app-color-border)] bg-white/80 backdrop-blur pt-16 pb-8 text-xs text-[var(--app-color-text-muted)]">
        <div className="mx-auto max-w-5xl px-6 grid gap-8 md:grid-cols-12 mb-12">
          
          {/* Brand col */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-color-primary)] text-white shadow-sm">
                <Package className="h-4.5 w-4.5" />
              </span>
              <span className="font-black text-sm uppercase tracking-widest text-[var(--app-color-text)]">
                AssetFlow
              </span>
            </div>
            <p className="leading-relaxed text-[11px]">
              A centralized ERP platform simplifying how organizations track physical capital and shared resources. Built for the Odoo Hack 2025 presentation.
            </p>
          </div>

          {/* Features links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-[var(--app-color-text)] text-[11px] uppercase tracking-wider">System Modules</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)]">Asset Directory</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)]">Allocations & Transfers</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)]">Shared Bookings</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)]">Audits & Maintenance</Link></li>
            </ul>
          </div>

          {/* Team Esc(Reality) info */}
          <div className="md:col-span-5 space-y-2.5">
            <h4 className="font-bold text-[var(--app-color-text)] text-[11px] uppercase tracking-wider">Team Esc(Reality);</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-slate-700">Saman Pandey</p>
                <p className="text-[10px] text-slate-400">UI/UX & Documentation</p>
                <a href="https://github.com/SamanPandey-in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[var(--app-color-primary)] hover:underline mt-1">
                  <Globe className="h-3 w-3" /> GitHub <ExternalLink className="h-2 w-2" />
                </a>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Jagdish Padhi</p>
                <p className="text-[10px] text-slate-400">Backend & Integration</p>
                <a href="https://github.com/Jagdish-Padhi" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[var(--app-color-primary)] hover:underline mt-1">
                  <Globe className="h-3 w-3" /> GitHub <ExternalLink className="h-2 w-2" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mx-auto max-w-5xl px-6 border-t border-[var(--app-color-border)]/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px]">
          <p>© 2026 AssetFlow Platform. All rights reserved.</p>
          <p className="font-semibold text-slate-500">Built with ❤️ for Odoo Hack 2025 by Team Esc(Reality);</p>
        </div>
      </footer>
    </div>
  );
}
