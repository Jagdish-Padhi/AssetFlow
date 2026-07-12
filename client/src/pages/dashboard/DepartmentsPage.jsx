import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import api from '../../services/api.js';
import { Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" subtitle="Manage organizational departments and hierarchies." />
      <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-(--app-color-text-muted)">Loading departments…</p>
        ) : departments.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
            <p className="text-sm text-(--app-color-text-muted)">No departments yet. Create your first department to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-(--app-color-border) bg-(--app-color-surface-elevated)">
              <tr>
                {['Name', 'Status', 'Created'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--app-color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--app-color-border)">
              {departments.map(d => (
                <tr key={d.id} className="hover:bg-(--app-color-surface-elevated) transition-colors">
                  <td className="px-6 py-4 font-semibold text-(--app-color-text)">{d.name}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                  </td>
                  <td className="px-6 py-4 text-(--app-color-text-muted)">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
