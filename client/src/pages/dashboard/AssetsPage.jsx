import PageHeader from '../../components/PageHeader.jsx';
import { Package } from 'lucide-react';

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        subtitle="Register, track, and manage your organization's physical assets."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-10 text-center shadow-sm">
        <Package className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
        <p className="text-sm font-semibold text-(--app-color-text-muted)">Asset directory coming soon — Phase 3 UI</p>
      </div>
    </div>
  );
}
