import { useState, useEffect, useCallback } from 'react';
import { FileSearch, Plus, Eye, CheckCircle, XCircle, AlertTriangle, Lock, UserPlus } from 'lucide-react';
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
import {
  auditStatusMeta,
  auditItemStatusMeta,
  AUDIT_ITEM_STATUS_OPTIONS,
  RESOLUTION_OPTIONS,
} from '../../utils/auditStatus.js';

const EMPTY_FORM = { name: '', departmentScopeId: '', locationScope: '', startDate: '', endDate: '' };
const EMPTY_ITEM = { assetId: '', auditorId: '', status: 'verified', remarks: '', evidencePhotoUrl: '' };

export default function AuditsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'asset_manager';

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [auditItems, setAuditItems] = useState([]);
  const [report, setReport] = useState(null);
  const [employees, setEmployees] = useState([]);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/audits', { params });
      setAudits(res.data.items || []);
    } catch {
      toast.error('Failed to load audits.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { loadAudits(); }, [loadAudits]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await api.get('/employees', { params: { role: 'department_head' } });
      const techRes = await api.get('/employees', { params: { role: 'technician' } });
      const all = [...(res.data.items || []), ...(techRes.data.items || [])];
      const unique = [...new Map(all.map(e => [e.id, e])).values()];
      setEmployees(unique);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const handleCreate = async () => {
    if (!formData.name.trim()) return toast.error('Audit name is required.');
    if (!formData.startDate) return toast.error('Start date is required.');
    setSaving(true);
    try {
      await api.post('/audits', formData);
      toast.success('Audit created.');
      setCreateOpen(false);
      setFormData(EMPTY_FORM);
      loadAudits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create audit.');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (audit) => {
    try {
      const [auditRes, itemsRes] = await Promise.all([
        api.get(`/audits/${audit.id}`),
        api.get(`/audits/${audit.id}/items`),
      ]);
      setSelected(auditRes.data.item);
      setAuditItems(itemsRes.data.items || []);
      setDetailOpen(true);
    } catch {
      toast.error('Failed to load audit details.');
    }
  };

  const handleAddItem = async () => {
    if (!itemForm.assetId.trim()) return toast.error('Asset ID is required.');
    if (!itemForm.auditorId.trim()) return toast.error('Auditor ID is required.');
    setSaving(true);
    try {
      await api.post(`/audits/${selected.id}/items`, itemForm);
      toast.success('Asset added to audit.');
      setAddItemOpen(false);
      setItemForm(EMPTY_ITEM);
      const itemsRes = await api.get(`/audits/${selected.id}/items`);
      setAuditItems(itemsRes.data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Close this audit? Missing assets will be marked as lost, damaged as retired.')) return;
    try {
      const result = await api.patch(`/audits/${selected.id}/close`);
      toast.success(`Audit closed. ${result.data.discrepanciesFound} discrepancies found.`);
      setDetailOpen(false);
      loadAudits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close audit.');
    }
  };

  const openReport = async (audit) => {
    try {
      const res = await api.get(`/audits/${audit.id}/report`);
      setReport(res.data.report);
      setReportOpen(true);
    } catch {
      toast.error('Failed to load report.');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Audit', render: (v, row) => (
        <div>
          <p className="font-semibold text-(--app-color-text)">{v}</p>
          {row.locationScope && <p className="text-xs text-(--app-color-text-muted)">{row.locationScope}</p>}
        </div>
      ),
    },
    {
      key: 'startDate', label: 'Start Date', render: (v) => (
        <span className="text-sm">{v ? new Date(v).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'endDate', label: 'End Date', render: (v) => (
        <span className="text-sm">{v ? new Date(v).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'status', label: 'Status', render: (v) => {
        const meta = auditStatusMeta(v);
        return <Badge variant={meta.variant} size="sm">{meta.label}</Badge>;
      },
    },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openDetail(row)}><Eye className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => openReport(row)}><FileSearch className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const itemColumns = [
    {
      key: 'assetId', label: 'Asset', render: (v) => (
        <span className="font-mono text-xs">{v?.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'auditorId', label: 'Auditor', render: (v) => (
        <span className="font-mono text-xs">{v?.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'status', label: 'Status', render: (v) => {
        const meta = auditItemStatusMeta(v);
        return <Badge variant={meta.variant} size="sm">{meta.label}</Badge>;
      },
    },
    { key: 'remarks', label: 'Remarks', render: (v) => <span className="text-sm truncate max-w-[200px] block">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        subtitle="Schedule and run periodic asset verification cycles."
        action={isAdmin ? <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Audit</Button> : null}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          placeholder="All Statuses"
          options={[
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ]}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Table */}
      {!loading && audits.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No audits yet"
          message="Create an audit cycle to start verifying your organization's assets."
          action={isAdmin ? <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Audit</Button> : null}
        />
      ) : (
        <Table columns={columns} data={audits} isLoading={loading} emptyMessage="No audits found." />
      )}

      {/* Create Audit Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Audit Cycle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create Audit</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Audit Name" name="name" required value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Q1 2026 IT Asset Audit" />
          <Input label="Department Scope (optional)" name="departmentScopeId" value={formData.departmentScopeId} onChange={(e) => setFormData((f) => ({ ...f, departmentScopeId: e.target.value }))} placeholder="UUID of department (leave blank for all)" />
          <Input label="Location Scope (optional)" name="locationScope" value={formData.locationScope} onChange={(e) => setFormData((f) => ({ ...f, locationScope: e.target.value }))} placeholder="e.g. Building A, Floor 3" />
          <Input label="Start Date" name="startDate" type="date" required value={formData.startDate} onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))} />
          <Input label="End Date (optional)" name="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))} />
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name || 'Audit Details'}
        size="xl"
        footer={
          selected?.status === 'open' && isAdmin ? (
            <>
              <Button variant="secondary" onClick={() => setAddItemOpen(true)}>Add Asset</Button>
              <Button variant="danger" onClick={handleClose}><Lock className="h-4 w-4" /> Close Audit</Button>
            </>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Status</p>
                <Badge variant={auditStatusMeta(selected.status).variant} className="mt-1">{auditStatusMeta(selected.status).label}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Location</p>
                <p className="text-sm mt-1">{selected.locationScope || 'All locations'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Start Date</p>
                <p className="text-sm mt-1">{selected.startDate ? new Date(selected.startDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">End Date</p>
                <p className="text-sm mt-1">{selected.endDate ? new Date(selected.endDate).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-(--app-color-text) mb-2">Audited Assets ({auditItems.length})</h4>
              {auditItems.length === 0 ? (
                <p className="text-sm text-(--app-color-text-muted)">No assets have been audited yet.</p>
              ) : (
                <div className="rounded-xl border border-(--app-color-border) overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-(--app-color-surface-elevated)">
                      <tr>
                        {['Asset', 'Auditor', 'Status', 'Remarks'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-(--app-color-text-muted)">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--app-color-border)">
                      {auditItems.map((item) => (
                        <tr key={item.id} className="hover:bg-(--app-color-surface-elevated) transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{item.assetId?.slice(0, 8)}…</td>
                          <td className="px-4 py-3 font-mono text-xs">{item.auditorId?.slice(0, 8)}…</td>
                          <td className="px-4 py-3">
                            <Badge variant={auditItemStatusMeta(item.status).variant} size="sm">{auditItemStatusMeta(item.status).label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm truncate max-w-[200px]">{item.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        title="Add Asset to Audit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} loading={saving}>Add Asset</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Asset ID" name="assetId" required value={itemForm.assetId} onChange={(e) => setItemForm((f) => ({ ...f, assetId: e.target.value }))} placeholder="Enter the asset UUID" />
          <Input label="Auditor ID" name="auditorId" required value={itemForm.auditorId} onChange={(e) => setItemForm((f) => ({ ...f, auditorId: e.target.value }))} placeholder="Enter auditor UUID" />
          <Select label="Verification Status" name="status" options={AUDIT_ITEM_STATUS_OPTIONS} value={itemForm.status} onChange={(e) => setItemForm((f) => ({ ...f, status: e.target.value }))} />
          <TextArea label="Remarks (optional)" name="remarks" value={itemForm.remarks} onChange={(e) => setItemForm((f) => ({ ...f, remarks: e.target.value }))} placeholder="Any notes about this asset..." />
          <Input label="Evidence Photo URL (optional)" name="evidencePhotoUrl" value={itemForm.evidencePhotoUrl} onChange={(e) => setItemForm((f) => ({ ...f, evidencePhotoUrl: e.target.value }))} placeholder="https://..." />
        </div>
      </Modal>

      {/* Discrepancy Report Modal */}
      <Modal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Discrepancy Report"
        size="lg"
      >
        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Audit</p>
                <p className="text-sm font-semibold mt-1">{report.audit.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Status</p>
                <Badge variant={auditStatusMeta(report.audit.status).variant} className="mt-1">{auditStatusMeta(report.audit.status).label}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Total', value: report.summary.total, color: 'text-(--app-color-text)' },
                { label: 'Verified', value: report.summary.verified, color: 'text-green-600' },
                { label: 'Missing', value: report.summary.missing, color: 'text-red-600' },
                { label: 'Damaged', value: report.summary.damaged, color: 'text-yellow-600' },
                { label: 'Unresolved', value: report.summary.unresolved, color: 'text-orange-600' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-(--app-color-border) p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-(--app-color-text-muted) mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {report.items.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-(--app-color-text) mb-2">All Items</h4>
                <div className="rounded-xl border border-(--app-color-border) overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-(--app-color-surface-elevated) sticky top-0">
                      <tr>
                        {['Asset', 'Status', 'Resolution', 'Remarks'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-(--app-color-text-muted)">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--app-color-border)">
                      {report.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-mono text-xs">{item.assetId?.slice(0, 8)}…</td>
                          <td className="px-4 py-3">
                            <Badge variant={auditItemStatusMeta(item.status).variant} size="sm">{auditItemStatusMeta(item.status).label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{item.resolutionStatus?.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-sm truncate max-w-[150px]">{item.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
