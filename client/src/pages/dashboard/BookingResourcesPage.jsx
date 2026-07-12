import { useCallback, useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import TextArea from '../../components/TextArea.jsx';
import Select from '../../components/Select.jsx';
import Toggle from '../../components/Toggle.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_OPTIONS } from '../../utils/bookingStatus.js';

const EMPTY_FORM = { name: '', type: 'meeting_room', location: '', capacity: '', description: '', requiresApproval: false, isActive: true };

export default function BookingResourcesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/booking-resources');
      setItems(res.data.items || []);
    } catch {
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleOpenCreate = () => { setEditId(null); setFormData(EMPTY_FORM); setModalOpen(true); };
  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      location: item.location || '',
      capacity: item.capacity ?? '',
      description: item.description || '',
      requiresApproval: item.requiresApproval,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };
  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error('Name is required.');
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/booking-resources/${editId}`, formData);
        toast.success('Resource updated.');
      } else {
        await api.post('/booking-resources', formData);
        toast.success('Resource created.');
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (item) => {
    if (!window.confirm(`Deactivate "${item.name}"? It will no longer be bookable.`)) return;
    try {
      await api.delete(`/booking-resources/${item.id}`);
      toast.success('Resource deactivated.');
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate resource.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v, row) => (
      <div>
        <p className="font-semibold text-(--app-color-text)">{v}</p>
        {row.location && <p className="text-xs text-(--app-color-text-muted)">{row.location}</p>}
      </div>
    ) },
    { key: 'type', label: 'Type', render: (v) => RESOURCE_TYPE_LABELS[v] || v },
    { key: 'capacity', label: 'Capacity', render: (v) => (v != null ? v : '—') },
    { key: 'requiresApproval', label: 'Approval', render: (v) => (v ? <Badge variant="warning" size="sm">Required</Badge> : <Badge variant="secondary" size="sm">Auto-confirm</Badge>) },
    { key: 'isActive', label: 'Status', render: (v) => (v ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="outline" size="sm">Inactive</Badge>) },
    { key: 'id', label: '', render: (_, row) => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(row)}><Pencil className="h-4 w-4" /></Button>
        {row.isActive && <Button size="sm" variant="ghost" onClick={() => handleDeactivate(row)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookable Resources"
        subtitle="Meeting rooms, projectors, vehicles, equipment, and labs available for booking."
        action={<Button onClick={handleOpenCreate}><Plus className="h-4 w-4" /> Add Resource</Button>}
      />

      {!loading && items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No resources yet"
          message="Add a meeting room, vehicle, or piece of equipment to start taking bookings."
          action={<Button onClick={handleOpenCreate}><Plus className="h-4 w-4" /> Add Resource</Button>}
        />
      ) : (
        <Table columns={columns} data={items} isLoading={loading} emptyMessage="No resources found." />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Resource' : 'Add Resource'}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editId ? 'Save Changes' : 'Create Resource'}</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <Input label="Name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Room B2" />
          <Select label="Type" name="type" required options={RESOURCE_TYPE_OPTIONS} value={formData.type} onChange={handleChange} />
          <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. 2nd Floor, East Wing" />
          <Input label="Capacity" name="capacity" type="number" min="0" value={formData.capacity} onChange={handleChange} placeholder="e.g. 8 (leave blank if not applicable)" />
          <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Optional notes about this resource" />
          <div className="flex items-center justify-between rounded-lg border border-(--app-color-border) px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-(--app-color-text)">Requires approval</p>
              <p className="text-xs text-(--app-color-text-muted)">Bookings start as "Pending" until approved.</p>
            </div>
            <Toggle checked={formData.requiresApproval} onChange={(v) => setFormData((f) => ({ ...f, requiresApproval: v }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
