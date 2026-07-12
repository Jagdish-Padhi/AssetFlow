import { FileSearch } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
export default function AuditsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audits" subtitle="Schedule and run periodic asset verification cycles." />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-10 text-center shadow-sm">
        <FileSearch className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
        <p className="text-sm text-(--app-color-text-muted)">Audit management coming soon — Phase 7 UI</p>
      </div>
    </div>
  );
}
