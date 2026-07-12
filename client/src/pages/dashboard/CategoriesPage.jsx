import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import TextArea from '../../components/TextArea.jsx';

const EMPTY_FORM = { name: '', description: '' };

export default function CategoriesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.items || []);
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error('Name is required.');
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/categories/${editId}`, formData);
        toast.success('Category updated.');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success('Category deleted.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v) => <span className="font-semibold text-(--app-color-text)">{v}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (v) => <span className="text-(--app-color-text-muted) max-w-xs truncate block">{v || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v) => <span className="text-(--app-color-text-muted)">{new Date(v).toLocaleDateString()}</span>,
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Categories"
        subtitle="Organize assets by category with custom field schemas."
        action={isAdmin ? (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        ) : null}
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
        <Table columns={columns} data={categories} isLoading={loading} emptyMessage="No categories found." />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Category' : 'New Category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editId ? 'Save Changes' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Laptops, Vehicles, Furniture"
          />
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description for this category"
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
