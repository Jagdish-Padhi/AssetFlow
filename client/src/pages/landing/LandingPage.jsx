import { Link } from 'react-router-dom';
import { Package, CalendarCheck, Wrench, FileSearch, ShieldCheck, Activity } from 'lucide-react';

const FEATURES = [
  { icon: <Package className="h-8 w-8 text-(--app-color-primary)" />, title: 'Asset Lifecycle Tracking', desc: 'Monitor your physical assets from acquisition to retirement with a flexible, real-time lifecycle engine.' },
  { icon: <CalendarCheck className="h-8 w-8 text-(--app-color-primary)" />, title: 'Conflict-Free Booking', desc: 'Reserve shared resources, vehicles, and equipment seamlessly without worrying about double-allocations.' },
  { icon: <Wrench className="h-8 w-8 text-(--app-color-primary)" />, title: 'Maintenance Workflow', desc: 'Route repair requests through a streamlined approval process before work begins.' },
  { icon: <FileSearch className="h-8 w-8 text-(--app-color-primary)" />, title: 'Scheduled Audit Cycles', desc: 'Run structured verification cycles with assigned auditors and auto-generated discrepancy reports.' },
  { icon: <ShieldCheck className="h-8 w-8 text-(--app-color-primary)" />, title: 'Role-Based Access', desc: 'Securely manage permissions across Admins, Asset Managers, Department Heads, and Employees.' },
  { icon: <Activity className="h-8 w-8 text-(--app-color-primary)" />, title: 'Advanced Analytics', desc: 'Track asset utilization trends, maintenance frequency, and department-wise summaries via KPI dashboards.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* Aurora background blobs */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-16">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-color-primary) text-white shadow-md">
            <Package className="h-6 w-6" />
          </span>
          <span className="text-lg font-black uppercase tracking-widest text-(--app-color-text)">
            AssetFlow
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-(--app-color-text) hover:bg-white/60 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-(--app-color-primary) px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-(--app-color-primary-hover) transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center lg:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--app-color-border) bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-(--app-color-primary) backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-(--app-color-primary)" />
          Enterprise Asset & Resource Management
        </div>

        <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tighter text-(--app-color-text) lg:text-7xl">
          Transform Chaos Into<br />
          <span className="text-(--app-color-primary)">Predictive Operations</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-(--app-color-text-muted) leading-relaxed">
          AssetFlow is a centralized ERP platform that brings all your physical assets, shared resources, and maintenance requests into one conflict-free workflow.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/register" className="rounded-2xl bg-(--app-color-primary) px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
            Launch Workspace →
          </Link>
          <Link to="/login" className="rounded-2xl border border-(--app-color-border) bg-white/70 px-8 py-4 text-base font-semibold text-(--app-color-text) backdrop-blur hover:bg-white transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-4 text-center text-3xl font-black tracking-tight text-(--app-color-text)">
          Complete Enterprise Visibility
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-(--app-color-text-muted)">
          Everything you need to digitize, allocate, and maintain your organization's physical assets efficiently.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-(--app-color-border)/60 bg-white/70 p-6 backdrop-blur transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="mb-4">{feat.icon}</div>
              <h3 className="mb-2 text-base font-bold text-(--app-color-text)">{feat.title}</h3>
              <p className="text-sm text-(--app-color-text-muted) leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-16 text-center">
        <h2 className="mb-4 text-3xl font-black text-(--app-color-text)">Ready to regain control?</h2>
        <p className="mb-8 text-(--app-color-text-muted)">Join modern teams who trust AssetFlow to manage their resources.</p>
        <Link to="/register" className="rounded-2xl bg-(--app-color-primary) px-10 py-4 text-base font-bold text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
          Start Your Trial →
        </Link>
      </section>
    </div>
  );
}
