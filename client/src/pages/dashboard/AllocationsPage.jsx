import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Select from '../../components/Select.jsx';
import Input from '../../components/Input.jsx';
import TextArea from '../../components/TextArea.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const EMPTY_FORM = {
  assetId: '',
  assignedToId: '',
  expectedReturnDate: '',
  notes: '',
};

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-500',
};

export default function AllocationsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';

  const [allocations, setAllocations] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Return asset states
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [conditionOnReturn, setConditionOnReturn] = useState('good');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allocsRes, assetsRes, empsRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/assets', { params: { status: 'available' } }),
        api.get('/employees'),
      ]);
      setAllocations(allocsRes.data.items || []);
      setAvailableAssets(assetsRes.data.items || []);
      setEmployees(empsRes.data.items || []);
    } catch {
      toast.error('Failed to load allocations data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.assetId) return toast.error('Asset is required.');
    if (!formData.assignedToId) return toast.error('Employee is required.');

    setSaving(true);
    try {
      await api.post('/allocations', {
        ...formData,
        expectedReturnDate: formData.expectedReturnDate || null,
      });
      toast.success('Asset allocated successfully.');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReturn = (alloc) => {
    setSelectedAllocation(alloc);
    setConditionOnReturn(alloc.condition || 'good');
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedAllocation) return;
    setSaving(true);
    try {
      await api.patch(`/allocations/${selectedAllocation.id}/return`, {
        conditionOnReturn,
      });
      toast.success('Asset returned successfully.');
      setReturnModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'assetId',
      label: 'Asset / Tag',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-(--app-color-text)">{row.assetName || 'Asset Name'}</p>
          <p className="text-xs font-mono text-(--app-color-text-muted)">{row.assetTag || 'Tag'}</p>
        </div>
      ),
    },
    {
      key: 'assignedToId',
      label: 'Assigned To',
      render: (v, row) => employees.find((e) => e.id === v)?.name || row.employeeName || '—',
    },
    {
      key: 'expectedReturnDate',
      label: 'Expected Return',
      render: (v) => (v ? new Date(v).toLocaleDateString() : 'Indefinite'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[v] || 'bg-gray-100'}`}>
          {v}
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
          {(row.status === 'active' || row.status === 'overdue') && (
            <Button size="sm" variant="secondary" onClick={() => handleOpenReturn(row)}>
              <Undo2 className="h-4 w-4 mr-1.5" /> Return
            </Button>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocations"
        subtitle="Track asset ownership, assignment history, and returns."
        action={isAdminOrManager && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Allocate Asset
          </Button>
        )}
      />

      {!loading && allocations.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No allocations yet"
          message="Assign physical assets to employees to begin tracking."
          action={isAdminOrManager && (
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" /> Allocate Asset
            </Button>
          )}
        />
      ) : (
        <div className="rounded-2xl border border-(--app-color-border) bg-white shadow-sm overflow-hidden">
          <Table columns={columns} data={allocations} isLoading={loading} emptyMessage="No allocations found." />
        </div>
      )}

      {/* Allocate Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Allocate Asset"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>Allocate</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <Select
            label="Select Asset"
            name="assetId"
            required
            value={formData.assetId}
            onChange={handleChange}
            options={availableAssets.map((a) => ({ value: a.id, label: `${a.name} (${a.assetTag})` }))}
            placeholder="Choose an available asset"
          />
          <Select
            label="Assign To Employee"
            name="assignedToId"
            required
            value={formData.assignedToId}
            onChange={handleChange}
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.email})` }))}
            placeholder="Choose an employee"
          />
          <Input
            label="Expected Return Date (Optional)"
            name="expectedReturnDate"
            type="date"
            value={formData.expectedReturnDate}
            onChange={handleChange}
          />
          <TextArea
            label="Allocation Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional purpose or instructions"
            rows={2}
          />
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Process Asset Return"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setReturnModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmReturn} loading={saving}>Process Return</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <p className="text-sm text-(--app-color-text-muted)">
            Confirm the return of this asset. Please select its current condition below.
          </p>
          <Select
            label="Condition on Return"
            value={conditionOnReturn}
            onChange={(e) => setConditionOnReturn(e.target.value)}
            options={[
              { value: 'new', label: 'New' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
