import { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, Eye, CheckCircle, XCircle, UserPlus, Play, CheckSquare, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import TextArea from '../../components/TextArea.jsx';
import Select from '../../components/Select.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { MAINTENANCE_STATUS_META, maintenanceStatusMeta, ISSUE_TYPE_OPTIONS, PRIORITY_OPTIONS } from '../../utils/maintenanceStatus.js';

const EMPTY_FORM = { assetId: '', description: '', priority: 'medium', issueType: '', photoUrl: '' };

export default function MaintenancePage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'asset_manager';
  const isTechnician = user?.role === 'technician';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await api.get('/maintenance', { params });
      setTickets(res.data.items || []);
    } catch {
      toast.error('Failed to load maintenance tickets.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const loadTechnicians = useCallback(async () => {
    try {
      const res = await api.get('/employees', { params: { role: 'technician' } });
      setTechnicians(res.data.items || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadTechnicians(); }, [loadTechnicians]);

  const handleCreate = async () => {
    if (!formData.assetId.trim()) return toast.error('Asset ID is required.');
    if (!formData.description.trim()) return toast.error('Description is required.');
    setSaving(true);
    try {
      await api.post('/maintenance', formData);
      toast.success('Maintenance request created.');
      setCreateOpen(false);
      setFormData(EMPTY_FORM);
      loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (id, action, payload = {}) => {
    try {
      await api.patch(`/maintenance/${id}/${action}`, payload);
      toast.success(`Ticket ${action}d.`);
      loadTickets();
      if (detailOpen && selected?.id === id) {
        const res = await api.get(`/maintenance/${id}`);
        setSelected(res.data.item);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}.`);
    }
  };

  const handleAssign = async () => {
    if (!technicianId) return toast.error('Select a technician.');
    await handleAction(selected.id, 'assign', { assignedTechnicianId: technicianId });
    setAssignOpen(false);
    setTechnicianId('');
  };

  const handleReject = async () => {
    await handleAction(selected.id, 'reject', { reason: rejectReason });
    setRejectOpen(false);
    setRejectReason('');
  };

  const handleResolve = async () => {
    await handleAction(selected.id, 'resolve', { completionNotes: resolveNotes });
    setResolveOpen(false);
    setResolveNotes('');
  };

  const openDetail = async (ticket) => {
    try {
      const res = await api.get(`/maintenance/${ticket.id}`);
      setSelected(res.data.item);
      setDetailOpen(true);
    } catch {
      toast.error('Failed to load ticket details.');
    }
  };

  const getActions = (t) => {
    const actions = [];
    if (isAdmin) {
      if (t.status === 'pending') {
        actions.push({ label: 'Approve', icon: CheckCircle, variant: 'success', onClick: () => handleAction(t.id, 'approve') });
        actions.push({ label: 'Reject', icon: XCircle, variant: 'danger', onClick: () => { setSelected(t); setRejectOpen(true); } });
      }
      if (t.status === 'approved') {
        actions.push({ label: 'Assign', icon: UserPlus, variant: 'primary', onClick: () => { setSelected(t); setAssignOpen(true); } });
      }
      if (t.status === 'resolved') {
        actions.push({ label: 'Close', icon: CheckSquare, variant: 'secondary', onClick: () => handleAction(t.id, 'close') });
      }
    }
    if ((isAdmin || isTechnician) && t.status === 'assigned') {
      actions.push({ label: 'Start', icon: Play, variant: 'info', onClick: () => handleAction(t.id, 'start') });
    }
    if ((isAdmin || isTechnician) && t.status === 'in_progress') {
      actions.push({ label: 'Resolve', icon: CheckCircle, variant: 'success', onClick: () => { setSelected(t); setResolveOpen(true); } });
    }
    return actions;
  };

  const columns = [
    {
      key: 'assetId', label: 'Asset', render: (v) => (
        <span className="font-mono text-xs text-(--app-color-text-muted)">{v?.slice(0, 8)}…</span>
      ),
    },
    { key: 'description', label: 'Description', render: (v) => <span className="font-medium text-(--app-color-text) max-w-xs truncate block">{v}</span> },
    {
      key: 'priority', label: 'Priority', render: (v) => (
        <Badge variant={v === 'high' ? 'danger' : v === 'medium' ? 'warning' : 'outline'} size="sm">{v}</Badge>
      ),
    },
    {
      key: 'status', label: 'Status', render: (v) => {
        const meta = maintenanceStatusMeta(v);
        return <Badge variant={meta.variant} size="sm">{meta.label}</Badge>;
      },
    },
    {
      key: 'actions', label: '', render: (_, row) => {
        const actions = getActions(row);
        return (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => openDetail(row)}><Eye className="h-4 w-4" /></Button>
            {actions.map((a) => (
              <Button key={a.label} size="sm" variant={a.variant} onClick={a.onClick}>
                <a.icon className="h-4 w-4" /> {a.label}
              </Button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        subtitle="Track and manage asset repair and maintenance requests."
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Request</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          placeholder="All Statuses"
          options={Object.entries(MAINTENANCE_STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-44"
        />
        <Select
          placeholder="All Priorities"
          options={PRIORITY_OPTIONS}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Table */}
      {!loading && tickets.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance tickets"
          message="Create a maintenance request to start tracking asset repairs."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Request</Button>}
        />
      ) : (
        <Table columns={columns} data={tickets} isLoading={loading} emptyMessage="No tickets found." />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Maintenance Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Asset ID" name="assetId" required value={formData.assetId} onChange={(e) => setFormData((f) => ({ ...f, assetId: e.target.value }))} placeholder="Enter the asset UUID" />
          <TextArea label="Description" name="description" required value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the issue..." />
          <Select label="Priority" name="priority" options={PRIORITY_OPTIONS} value={formData.priority} onChange={(e) => setFormData((f) => ({ ...f, priority: e.target.value }))} />
          <Select label="Issue Type" name="issueType" options={ISSUE_TYPE_OPTIONS} value={formData.issueType} onChange={(e) => setFormData((f) => ({ ...f, issueType: e.target.value }))} />
          <Input label="Photo URL (optional)" name="photoUrl" value={formData.photoUrl} onChange={(e) => setFormData((f) => ({ ...f, photoUrl: e.target.value }))} placeholder="https://..." />
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Maintenance Ticket Details"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Asset</p>
                <p className="font-mono text-sm mt-1">{selected.assetId}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Status</p>
                <Badge variant={maintenanceStatusMeta(selected.status).variant} className="mt-1">{maintenanceStatusMeta(selected.status).label}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Priority</p>
                <Badge variant={selected.priority === 'high' ? 'danger' : selected.priority === 'medium' ? 'warning' : 'outline'} className="mt-1">{selected.priority}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Issue Type</p>
                <p className="text-sm mt-1">{selected.issueType || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Description</p>
                <p className="text-sm mt-1">{selected.description}</p>
              </div>
              {selected.assignedTechnicianId && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Assigned Technician</p>
                  <p className="font-mono text-sm mt-1">{selected.assignedTechnicianId}</p>
                </div>
              )}
              {selected.completionNotes && (
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Completion Notes</p>
                  <p className="text-sm mt-1">{selected.completionNotes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Created</p>
                <p className="text-sm mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Updated</p>
                <p className="text-sm mt-1">{new Date(selected.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Technician"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </>
        }
      >
        <Select
          label="Technician"
          placeholder="Select a technician"
          options={technicians.map((t) => ({ value: t.id, label: t.name }))}
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Maintenance Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
          </>
        }
      >
        <TextArea label="Reason (optional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this request is rejected..." />
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve Maintenance Ticket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={handleResolve}>Mark Resolved</Button>
          </>
        }
      >
        <TextArea label="Completion Notes (optional)" value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} placeholder="Describe what was done to fix the issue..." />
      </Modal>
    </div>
  );
}
