import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import api from '../../services/api.js';
import { Users } from 'lucide-react';

const STATUS_STYLES = {
  active:  'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  returned:'bg-gray-100 text-gray-500',
};

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/allocations').then(r => setAllocations(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Allocations" subtitle="Track asset ownership and manage returns." />
      <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-(--app-color-text-muted)">Loading allocations…</p>
        ) : allocations.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
            <p className="text-sm text-(--app-color-text-muted)">No allocations found. Allocate an asset to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-(--app-color-border) bg-(--app-color-surface-elevated)">
              <tr>
                {['Asset ID', 'Assigned To', 'Expected Return', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--app-color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--app-color-border)">
              {allocations.map(a => (
                <tr key={a.id} className="hover:bg-(--app-color-surface-elevated) transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-(--app-color-text-muted)">{a.assetId?.slice(0,8)}…</td>
                  <td className="px-6 py-4 font-medium text-(--app-color-text)">{a.assignedToId?.slice(0,8)}…</td>
                  <td className="px-6 py-4 text-(--app-color-text-muted)">{a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[a.status] || STATUS_STYLES.returned}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
