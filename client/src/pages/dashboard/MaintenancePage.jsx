import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import api from '../../services/api.js';
import { Wrench } from 'lucide-react';

const STATUS_STYLES = {
  pending:     'bg-yellow-100 text-yellow-700',
  approved:    'bg-blue-100 text-blue-700',
  assigned:    'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-500',
  rejected:    'bg-red-100 text-red-700',
};
const PRIORITY_STYLES = { low: 'text-gray-500', medium: 'text-yellow-600', high: 'text-red-600' };

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/maintenance').then(r => setTickets(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" subtitle="Track and manage asset repair and maintenance requests." />
      <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-(--app-color-text-muted)">Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center">
            <Wrench className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
            <p className="text-sm text-(--app-color-text-muted)">No maintenance requests yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-(--app-color-border) bg-(--app-color-surface-elevated)">
              <tr>
                {['Asset', 'Description', 'Priority', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--app-color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--app-color-border)">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-(--app-color-surface-elevated) transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-(--app-color-text-muted)">{t.assetId?.slice(0,8)}…</td>
                  <td className="px-6 py-4 font-medium text-(--app-color-text) max-w-xs truncate">{t.description}</td>
                  <td className={`px-6 py-4 text-xs font-bold uppercase ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[t.status] || ''}`}>{t.status}</span>
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
