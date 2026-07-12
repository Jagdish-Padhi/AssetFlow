import { Link } from 'react-router-dom';
import {
  Package, CalendarCheck, Wrench, FileSearch, ShieldCheck, Activity,
  Users, Building2, ArrowRight, Globe, ExternalLink,
  BarChart3, Bell, CheckCircle2, ChevronRight,
} from 'lucide-react';
import BrandLogo from '../../components/BrandLogo.jsx';
import TowerLoader from '../../components/loaders/TowerLoader.jsx';



/* ── Feature modules ─────────────────────────────────────────────── */
const MODULES = [
  {
    icon: <Building2 className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Organization & Roles',
    desc: 'Manage departments, asset categories, and user roles — Admin, Asset Manager, Department Head, and Employee — with distinct, gated access.',
  },
  {
    icon: <Package className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Asset Registry',
    desc: 'Auto-generated asset tags, 7-state lifecycle tracking, category-specific custom specs, QR code scanning, and full per-asset history.',
  },
  {
    icon: <Users className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Allocation Engine',
    desc: 'Strict double-allocation prevention, condition-captured returns, overdue auto-flagging, and secured asset transfer requests between employees.',
  },
  {
    icon: <CalendarCheck className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Resource Bookings',
    desc: 'Visual calendar booking for shared equipment. Real-time overlap validation, hourly timeline views, and status tracking across all reservations.',
  },
  {
    icon: <Wrench className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Maintenance Workflows',
    desc: 'Submit work orders, route through managerial approval, and auto-flip asset status. Full ticket lifecycle from open to resolved.',
  },
  {
    icon: <FileSearch className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Audit Cycles',
    desc: 'Structured department verification rounds with assigned auditors. Auto-generate discrepancy reports and lock cycles to mark missing assets as Lost.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Analytics & Reports',
    desc: 'Live KPI dashboards — utilization rates, maintenance frequency, department-wise summaries. Export A4 executive PDF or granular CSV datasets.',
  },
  {
    icon: <Bell className="h-6 w-6 text-[var(--app-color-primary)]" />,
    title: 'Smart Alerts',
    desc: 'Automated email and WhatsApp notifications for allocation events, overdue returns, maintenance approvals, and audit discrepancy flags.',
  },
];

/* ── Full system lifecycle flow ──────────────────────────────────── */
const FLOW = [
  {
    step: '01',
    label: 'Organisation Setup',
    detail: 'Define departments & asset categories. Assign roles — Admin, Asset Manager, Department Head.',
    icon: <Building2 className="h-5 w-5" />,
    tag: 'Foundation',
  },
  {
    step: '02',
    label: 'Asset Registration',
    detail: 'Onboard inventory with auto-tags, category specs (RAM, mileage, etc.) and QR code binding.',
    icon: <Package className="h-5 w-5" />,
    tag: 'Intake',
  },
  {
    step: '03',
    label: 'Allocate & Transfer',
    detail: 'Assign to employees. Conflict engine prevents double-booking. Capture return conditions.',
    icon: <Users className="h-5 w-5" />,
    tag: 'Deployment',
  },
  {
    step: '04',
    label: 'Book Shared Resources',
    detail: 'Reserve shared assets via calendar with hourly timelines. Automatic overlap rejection.',
    icon: <CalendarCheck className="h-5 w-5" />,
    tag: 'Scheduling',
  },
  {
    step: '05',
    label: 'Maintenance & Repair',
    detail: 'Raise work orders. Approval flips status to Under Maintenance. Resolution reverts to Available.',
    icon: <Wrench className="h-5 w-5" />,
    tag: 'Upkeep',
  },
  {
    step: '06',
    label: 'Audit & Report',
    detail: 'Run verification cycles, lock discrepancy reports, and export A4 corporate PDF summaries.',
    icon: <BarChart3 className="h-5 w-5" />,
    tag: 'Governance',
  },
];

/* ── Stat highlights ─────────────────────────────────────────────── */
const STATS = [
  { value: '7', label: 'Asset Lifecycle States' },
  { value: '4', label: 'Role-Based Access Tiers' },
  { value: '360°', label: 'Per-Asset Audit History' },
  { value: '0', label: 'Double-Allocations Possible' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden font-sans" style={{ background: 'var(--app-gradient-shell)' }}>
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 lg:px-20 border-b border-[var(--app-color-border)]/30 bg-white/50 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-color-primary)] text-white shadow-lg shadow-[var(--app-color-primary)]/20 shadow-primary/20">
            <Package className="h-5 w-5 btn-primary-solid" />
          </span>
          <BrandLogo size="lg" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--app-color-text-muted)] hover:text-[var(--app-color-text)] transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-primary-solid rounded-lg bg-[var(--app-color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--app-color-primary)]/25 hover:bg-[var(--app-color-primary-hover)] transition-all hover:scale-[1.02]"
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column (Main Text) */}
          <div className="text-left lg:col-span-7 flex flex-col items-start">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--app-color-border)] bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--app-color-primary)] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--app-color-primary)] animate-pulse" />
              Odoo Hackathon 2026 — Enterprise Operations Track
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-black leading-[1.1] tracking-tight text-[var(--app-color-text)] sm:text-5xl lg:text-6xl">
              Your Organization's Assets.<br />
              <span className="text-[var(--app-color-primary)]">Finally Under Control.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mb-8 text-base text-[var(--app-color-text-muted)] leading-relaxed max-w-xl">
              Spreadsheets break. Paper logs get lost. Shared equipment gets double-booked. <br className="hidden md:block" />
              <strong className="text-[var(--app-color-text)] font-semibold">AssetFlow</strong> is the centralized ERP that replaces manual chaos with a structured, conflict-free operational pipeline — from first registration to final audit.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col items-center gap-3 sm:flex-row w-full sm:w-auto">
              <Link
                to="/register"
                className="btn-primary-solid w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-color-primary)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--app-color-primary)]/30 hover:bg-[var(--app-color-primary-hover)] transition-all hover:scale-[1.02]"
              >
                Launch Workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--app-color-border)] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[var(--app-color-text)] backdrop-blur hover:bg-white transition-colors"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column (TowerLoader Animation) */}
          <div className="lg:col-span-5 flex justify-center items-center py-8 lg:py-0">
            <div className="relative flex items-center justify-center w-72 h-72 rounded-3xl bg-white/30 border border-white/40 shadow-inner backdrop-blur-md">
              {/* Decorative rings */}
              <div className="absolute inset-4 rounded-full border border-dashed border-[var(--app-color-border)]/50 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-12 rounded-full border border-dashed border-[var(--app-color-primary)]/20 animate-[spin_30s_linear_infinite_reverse]" />
              
              <div className="scale-[2.5] relative -top-3">
                <TowerLoader />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 gap-px rounded-2xl overflow-hidden border border-[var(--app-color-border)] bg-[var(--app-color-border)] sm:grid-cols-4 shadow-sm">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/80 backdrop-blur px-6 py-6 text-center">
              <p className="text-3xl font-black text-[var(--app-color-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--app-color-text-muted)] mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Full Asset Lifecycle Flow ────────────────────────────── */}
      <section className="relative z-10 border-t border-[var(--app-color-border)]/40 py-24">
        <div className="mx-auto max-w-6xl px-8">
          {/* Section heading */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-color-primary)] mb-3">End-to-End System Architecture</p>
            <h2 className="text-4xl font-black tracking-tight text-[var(--app-color-text)]">
              How Assets Move Through the Organization
            </h2>
            <p className="mt-4 text-base text-[var(--app-color-text-muted)] max-w-2xl mx-auto leading-relaxed">
              A complete six-stage pipeline governing every physical asset from initial onboarding through governance — far beyond conventional spreadsheet-era tracking.
            </p>
          </div>

          {/* Flow grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-[var(--app-color-border)] bg-white/70 p-7 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Step + tag */}
                <div className="flex items-center justify-between mb-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-color-primary)]/10 text-[var(--app-color-primary)]">
                    {item.icon}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--app-color-primary)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-color-primary)]">
                      {item.tag}
                    </span>
                    <span className="text-sm font-mono font-black text-slate-200">{item.step}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-base font-bold text-[var(--app-color-text)]">{item.label}</h3>
                <p className="text-sm text-[var(--app-color-text-muted)] leading-relaxed">{item.detail}</p>

                {/* Connector arrow except last */}
                {idx < FLOW.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--app-color-border)] hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Complete Modules Grid ────────────────────────────────── */}
      <section className="relative z-10 border-t border-[var(--app-color-border)]/40 py-24">
        <div className="mx-auto max-w-6xl px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-color-primary)] mb-3">Platform Capabilities</p>
            <h2 className="text-4xl font-black tracking-tight text-[var(--app-color-text)]">
              Every Module Built for Scale
            </h2>
            <p className="mt-4 text-base text-[var(--app-color-text-muted)] max-w-xl mx-auto leading-relaxed">
              Role-gated access, automated workflows, and real-time visibility across your entire asset operations.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-[var(--app-color-border)] bg-white/80 p-6 backdrop-blur hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-color-primary)]/10">
                  {m.icon}
                </div>
                <h3 className="mb-2 text-sm font-bold text-[var(--app-color-text)]">{m.title}</h3>
                <p className="text-xs text-[var(--app-color-text-muted)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-[var(--app-color-border)]/40 py-24">
        <div className="mx-auto max-w-3xl px-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-[var(--app-color-primary)]" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-[var(--app-color-text)] mb-5">
            Stop Managing Assets in Spreadsheets
          </h2>
          <p className="text-lg text-[var(--app-color-text-muted)] leading-relaxed mb-10">
            Join the platform that gives every department head, asset manager, and employee a unified, real-time view of every asset in your organization.
          </p>
          <Link
            to="/register"
            className="btn-primary-solid inline-flex items-center gap-2 rounded-xl bg-[var(--app-color-primary)] px-10 py-4 text-sm font-bold text-white shadow-lg shadow-[var(--app-color-primary)]/30 hover:bg-[var(--app-color-primary-hover)] transition-all hover:scale-[1.02]"
          >
            Launch Your Workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--app-color-border)]/60 bg-white/70 backdrop-blur-md pt-16 pb-8">
        <div className="mx-auto max-w-6xl px-8 grid gap-12 md:grid-cols-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-color-primary)] text-white shadow-md">
                <Package className="h-5 w-5 btn-primary-solid" />
              </span>
              <BrandLogo size="lg" />
            </div>
            <p className="text-sm text-[var(--app-color-text-muted)] leading-relaxed max-w-sm">
              A centralized ERP platform digitizing how organizations track, allocate, and maintain physical assets and shared resources. Built for the Odoo Hack 2025 — Enterprise Operations track.
            </p>
          </div>

          {/* System Modules */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--app-color-text)]">System Modules</h4>
            <ul className="space-y-2.5 text-sm text-[var(--app-color-text-muted)]">
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)] transition-colors">Asset Directory</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)] transition-colors">Allocations & Transfers</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)] transition-colors">Resource Bookings</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)] transition-colors">Maintenance</Link></li>
              <li><Link to="/login" className="hover:text-[var(--app-color-primary)] transition-colors">Audits & Reports</Link></li>
            </ul>
          </div>

          {/* Team */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--app-color-text)]">Team Esc(Reality);</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-color-primary)]/10 text-sm font-black text-[var(--app-color-primary)]">SP</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--app-color-text)]">Saman Pandey</p>
                  <p className="text-xs text-[var(--app-color-text-muted)]">Full Stack Developer</p>
                  <a href="https://github.com/SamanPandey-in" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--app-color-primary)] hover:underline mt-0.5">
                    <Globe className="h-3 w-3" /> github.com/SamanPandey-in <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-color-primary)]/10 text-sm font-black text-[var(--app-color-primary)]">JP</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--app-color-text)]">Jagdish Padhi</p>
                  <p className="text-xs text-[var(--app-color-text-muted)]">Full Stack Developer</p>
                  <a href="https://github.com/Jagdish-Padhi" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--app-color-primary)] hover:underline mt-0.5">
                    <Globe className="h-3 w-3" /> github.com/Jagdish-Padhi <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto max-w-6xl px-8 border-t border-[var(--app-color-border)]/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--app-color-text-muted)]">
          <p>© 2025 AssetFlow Platform. All rights reserved.</p>
          <p>Built with ❤️ for <strong className="text-[var(--app-color-text)]">Odoo Hackathon 2026</strong> · Team Esc(Reality);</p>
        </div>
      </footer>
    </div>
  );
}
