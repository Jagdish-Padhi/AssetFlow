import { useState, useEffect, useCallback } from 'react';
import { Users, ShieldAlert, Award, Building } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Table from '../../components/Table.jsx';
import Select from '../../components/Select.jsx';
import Badge from '../../components/Badge.jsx';

const ROLES = [
  { value: 'employee', label: 'Employee' },
  { value: 'asset_manager', label: 'Asset Manager' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'technician', label: 'Technician' },
  { value: 'admin', label: 'Admin' },
];

export default function EmployeesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data.items || []);
      setDepartments(deptRes.data.items || []);
    } catch {
      toast.error('Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/employees/${id}/role`, { role: newRole });
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, role: newRole } : e))
      );
      toast.success('Employee role updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDepartmentChange = async (id, newDeptId) => {
    try {
      await api.patch(`/employees/${id}/department`, { departmentId: newDeptId || null });
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, departmentId: newDeptId } : e))
      );
      toast.success('Employee department updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update department.');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/employees/${id}/status`, { status: nextStatus });
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e))
      );
      toast.success(`User set to ${nextStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-(--app-color-text)">{v}</p>
          <p className="text-xs text-(--app-color-text-muted)">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (v, row) => {
        if (!isAdmin || row.id === currentUser?.id) {
          return <span className="capitalize font-medium">{v.replace('_', ' ')}</span>;
        }
        return (
          <div className="w-[160px]">
            <Select
              value={v}
              onChange={(e) => handleRoleChange(row.id, e.target.value)}
              options={ROLES}
            />
          </div>
        );
      },
    },
    {
      key: 'departmentId',
      label: 'Department',
      render: (v, row) => {
        if (!isAdmin || row.id === currentUser?.id) {
          const dept = departments.find((d) => d.id === v);
          return <span className="font-medium">{dept?.name || 'Unassigned'}</span>;
        }
        return (
          <div className="w-[180px]">
            <Select
              value={v || ''}
              onChange={(e) => handleDepartmentChange(row.id, e.target.value)}
              options={[
                { value: '', label: 'Unassigned' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => (
        <button
          disabled={!isAdmin || row.id === currentUser?.id}
          onClick={() => handleStatusToggle(row.id, v)}
          className="focus:outline-none"
        >
          <Badge variant={v === 'active' ? 'success' : 'secondary'}>
            {v}
          </Badge>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        subtitle="Manage user roles, promote asset managers/technicians, and assign departments."
      />

      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 rounded-xl bg-slate-50 p-4">
          <ShieldAlert className="h-5 w-5 text-slate-500 shrink-0" />
          <p className="text-xs text-slate-600">
            <strong>Security Notice:</strong> Only system Administrators can elevate roles, assign departments, and suspend user accounts.
          </p>
        </div>

        <Table
          columns={columns}
          data={employees}
          isLoading={loading}
          emptyMessage="No employees found."
        />
      </div>
    </div>
  );
}
