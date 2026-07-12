import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';

const EMPTY_FORM = { name: '', status: 'active' };

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function DepartmentsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.items || []);
    } catch {
      toast.error('Failed to load departments.');
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

  const handleOpenEdit = (dept) => {
    setEditId(dept.id);
    setFormData({ name: dept.name, status: dept.status });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error('Name is required.');
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/departments/${editId}`, formData);
        toast.success('Department updated.');
      } else {
        await api.post('/departments', formData);
        toast.success('Department created.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete "${dept.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/departments/${dept.id}`);
      toast.success('Department deleted.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v) => <span className="font-semibold text-(--app-color-text)">{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {v}
        </span>
      ),
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
        title="Departments"
        subtitle="Manage organizational departments and hierarchies."
        action={isAdmin ? (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        ) : null}
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
        <Table columns={columns} data={departments} isLoading={loading} emptyMessage="No departments found." />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Department' : 'New Department'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editId ? 'Save Changes' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Information Technology"
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
            options={STATUS_OPTIONS}
          />
        </div>
      </Modal>
    </div>
  );
}
