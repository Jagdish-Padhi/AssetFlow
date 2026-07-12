import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import TextArea from '../../components/TextArea.jsx';
import Toggle from '../../components/Toggle.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const EMPTY_FORM = {
  name: '',
  categoryId: '',
  serialNumber: '',
  acquisitionDate: '',
  acquisitionCost: '',
  condition: 'good',
  currentLocation: '',
  departmentId: '',
  isBookable: false,
  remarks: '',
};

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const STATUS_STYLES = {
  available: 'bg-green-100 text-green-700',
  allocated: 'bg-blue-100 text-blue-700',
  reserved: 'bg-yellow-100 text-yellow-700',
  under_maintenance: 'bg-purple-100 text-purple-700',
  lost: 'bg-red-100 text-red-700',
  retired: 'bg-gray-100 text-gray-700',
  disposed: 'bg-gray-200 text-gray-500',
};

export default function AssetsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsRes, catsRes, deptsRes] = await Promise.all([
        api.get('/assets', { params: { search, status: statusFilter || undefined } }),
        api.get('/categories'),
        api.get('/departments'),
      ]);
      setAssets(assetsRes.data.items || []);
      setCategories(catsRes.data.items || []);
      setDepartments(deptsRes.data.items || []);
    } catch {
      toast.error('Failed to load assets data.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setFormData({
      name: item.name,
      categoryId: item.categoryId || '',
      serialNumber: item.serialNumber || '',
      acquisitionDate: item.acquisitionDate ? new Date(item.acquisitionDate).toISOString().substring(0, 10) : '',
      acquisitionCost: item.acquisitionCost || '',
      condition: item.condition || 'good',
      currentLocation: item.currentLocation || '',
      departmentId: item.departmentId || '',
      isBookable: item.isBookable || false,
      remarks: item.remarks || '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error('Name is required.');
    setSaving(true);
    try {
      const payload = {
        ...formData,
        acquisitionCost: formData.acquisitionCost ? Number(formData.acquisitionCost) : null,
        categoryId: formData.categoryId || null,
        departmentId: formData.departmentId || null,
      };

      if (editId) {
        await api.patch(`/assets/${editId}`, payload);
        toast.success('Asset updated.');
      } else {
        await api.post('/assets', payload);
        toast.success('Asset registered successfully.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await api.delete(`/assets/${item.id}`);
      toast.success('Asset deleted.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Asset',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-(--app-color-text)">{v}</p>
          <p className="text-xs font-mono text-(--app-color-text-muted)">{row.assetTag}</p>
        </div>
      ),
    },
    {
      key: 'categoryId',
      label: 'Category',
      render: (v) => categories.find((c) => c.id === v)?.name || '—',
    },
    {
      key: 'departmentId',
      label: 'Department',
      render: (v) => departments.find((d) => d.id === v)?.name || '—',
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (v) => <span className="capitalize">{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[v] || 'bg-gray-100'}`}>
          {v.replace('_', ' ')}
        </span>
      ),
    },
  ];

  if (isAdminOrManager) {
    columns.push({
      key: 'id',
      label: 'Actions',
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
        title="Assets"
        subtitle="Register, track, and manage your organization's physical assets."
        action={isAdminOrManager && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        )}
      />

      <div className="flex flex-wrap gap-4 rounded-2xl border border-(--app-color-border) bg-white p-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by asset name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'available', label: 'Available' },
              { value: 'allocated', label: 'Allocated' },
              { value: 'reserved', label: 'Reserved' },
              { value: 'under_maintenance', label: 'Under Maintenance' },
              { value: 'lost', label: 'Lost' },
              { value: 'retired', label: 'Retired' },
              { value: 'disposed', label: 'Disposed' },
            ]}
          />
        </div>
      </div>

      {!loading && assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets found"
          message="No assets match your search criteria. Add an asset to get started."
          action={isAdminOrManager && (
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          )}
        />
      ) : (
        <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
          <Table columns={columns} data={assets} isLoading={loading} emptyMessage="No assets found." />
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Asset' : 'Register Asset'}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editId ? 'Save Changes' : 'Register'}</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <Input label="Asset Name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Dell Latitude 5420" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select Category"
            />
            <Select
              label="Department Assignment"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
              placeholder="Select Department"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="e.g. CN-0XXXXX" />
            <Select label="Condition" name="condition" value={formData.condition} onChange={handleChange} options={CONDITION_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Acquisition Date" name="acquisitionDate" type="date" value={formData.acquisitionDate} onChange={handleChange} />
            <Input label="Acquisition Cost ($)" name="acquisitionCost" type="number" value={formData.acquisitionCost} onChange={handleChange} placeholder="0.00" />
          </div>
          <Input label="Current Location" name="currentLocation" value={formData.currentLocation} onChange={handleChange} placeholder="e.g. IT Lab 1" />
          <TextArea label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Optional notes" rows={2} />
          <div className="flex items-center justify-between rounded-lg border border-(--app-color-border) px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-(--app-color-text)">Allow Booking</p>
              <p className="text-xs text-(--app-color-text-muted)">Allow employees to book this asset as a resource.</p>
            </div>
            <Toggle checked={formData.isBookable} onChange={(v) => setFormData((f) => ({ ...f, isBookable: v }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
