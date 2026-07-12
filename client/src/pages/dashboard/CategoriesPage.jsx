import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import api from '../../services/api.js';
import { Tag } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Asset Categories" subtitle="Organize assets by category with custom field schemas." />
      <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-(--app-color-text-muted)">Loading categories…</p>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <Tag className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
            <p className="text-sm text-(--app-color-text-muted)">No categories yet. Create your first category to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-(--app-color-border) bg-(--app-color-surface-elevated)">
              <tr>
                {['Name', 'Description', 'Created'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--app-color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--app-color-border)">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-(--app-color-surface-elevated) transition-colors">
                  <td className="px-6 py-4 font-semibold text-(--app-color-text)">{c.name}</td>
                  <td className="px-6 py-4 text-(--app-color-text-muted) max-w-xs truncate">{c.description || '—'}</td>
                  <td className="px-6 py-4 text-(--app-color-text-muted)">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
