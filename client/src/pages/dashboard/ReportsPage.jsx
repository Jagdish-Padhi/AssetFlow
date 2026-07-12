import { useState, useEffect, useCallback } from 'react';
import { Download, BarChart3, TrendingUp, Printer, CheckSquare } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import api from '../../services/api.js';

const CHART_COLORS = ['#0f5f73', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const STATUS_LABELS = {
  available: 'Available', allocated: 'Allocated', reserved: 'Reserved',
  under_maintenance: 'Under Maintenance', lost: 'Lost', retired: 'Retired', disposed: 'Disposed',
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [assetStatus, setAssetStatus] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [deptDist, setDeptDist] = useState([]);
  const [maintStatus, setMaintStatus] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [utilization, setUtilization] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [as, cd, dd, ms, au, ut] = await Promise.all([
        api.get('/dashboard/charts/assets-by-status'),
        api.get('/dashboard/charts/assets-by-category'),
        api.get('/dashboard/charts/assets-by-department'),
        api.get('/dashboard/charts/maintenance-status'),
        api.get('/dashboard/analytics/audit-summary'),
        api.get('/dashboard/analytics/utilization'),
      ]);
      setAssetStatus(as.data.data || []);
      setCategoryDist(cd.data.data || []);
      setDeptDist(dd.data.data || []);
      setMaintStatus(ms.data.data || []);
      setAuditSummary(au.data.data || null);
      setUtilization(ut.data.data || null);
    } catch {
      toast.error('Failed to load reports data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/dashboard/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type.toUpperCase()} report exported successfully.`);
    } catch {
      toast.error(`Failed to export ${type} report.`);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
        }
      `}} />

      {/* Screen view page header */}
      <div className="print:hidden">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Actionable operational insights, asset utilization, and spreadsheet exports."
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handlePrintPdf}>
                <Printer className="h-4 w-4 mr-1.5" /> PDF Report
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('assets')}>
                <Download className="h-4 w-4 mr-1.5" /> Export Assets
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('maintenance')}>
                <Download className="h-4 w-4 mr-1.5" /> Export Maintenance
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('bookings')}>
                <Download className="h-4 w-4 mr-1.5" /> Export Bookings
              </Button>
            </div>
          }
        />
      </div>

      {/* Screen view content */}
      <div className="space-y-8 print:hidden">
        {/* Top row summaries */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Asset Utilization Rate">
            {loading ? (
              <div className="space-y-4 py-2">
                <Skeleton width="40%" height="2rem" />
                <Skeleton width="80%" height="1rem" />
                <Skeleton width="100%" height="0.5rem" className="rounded-full" />
              </div>
            ) : utilization ? (
              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-(--app-color-primary)">
                    {utilization.utilizationRate}%
                  </span>
                  <span className="text-xs text-(--app-color-text-muted) flex items-center gap-1 font-medium">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Active deployments
                  </span>
                </div>
                <p className="text-xs text-(--app-color-text-muted) mt-2">
                  {utilization.allocated} of {utilization.total} assets are currently in active use.
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div
                    className="bg-(--app-color-primary) h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${utilization.utilizationRate}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--app-color-text-muted)">No utilization data.</p>
            )}
          </Card>

          <Card title="Audit Operations Summary">
            {loading ? (
              <div className="space-y-3 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton width="40%" height="1rem" />
                    <Skeleton width="20%" height="1rem" />
                  </div>
                ))}
              </div>
            ) : auditSummary ? (
              <div className="space-y-2.5 text-xs py-1">
                <div className="flex justify-between items-center">
                  <span className="text-(--app-color-text-muted) font-medium">Open Audit Cycles</span>
                  <Badge variant="success" size="sm">{auditSummary.openAudits}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--app-color-text-muted) font-medium">Closed Audit Cycles</span>
                  <Badge variant="outline" size="sm">{auditSummary.closedAudits}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--app-color-text-muted) font-medium">Verified Inventory Items</span>
                  <Badge variant="success" size="sm">{auditSummary.verifiedItems}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--app-color-text-muted) font-medium">Missing/Lost Flags</span>
                  <Badge variant="danger" size="sm">{auditSummary.missingItems}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--app-color-text-muted)">No audit cycles run yet.</p>
            )}
          </Card>

          <Card title="Active Reports Information">
            <div className="text-xs text-(--app-color-text-muted) space-y-2 leading-relaxed">
              <p>
                Reports generated display live, real-time database state across departments, maintenance channels, and scheduled bookings.
              </p>
              <p>
                Clicking the export triggers a direct stream compilation returning verified spreadsheets formatted for immediate auditing.
              </p>
            </div>
          </Card>
        </div>

        {/* Grid for distribution charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Assets Status Breakdown">
            {loading ? (
              <Skeleton height="250px" />
            ) : assetStatus.length === 0 ? (
              <p className="text-sm text-center text-(--app-color-text-muted) py-12">No asset distribution data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={assetStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${STATUS_LABELS[status] || status}: ${count}`}
                  >
                    {assetStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Asset Categories Distribution">
            {loading ? (
              <Skeleton height="250px" />
            ) : categoryDist.length === 0 ? (
              <p className="text-sm text-center text-(--app-color-text-muted) py-12">No category data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryDist}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--app-color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Deployments by Department">
            {loading ? (
              <Skeleton height="250px" />
            ) : deptDist.length === 0 ? (
              <p className="text-sm text-center text-(--app-color-text-muted) py-12">No department assignments.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptDist} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="department" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Maintenance Work Orders Overview">
            {loading ? (
              <Skeleton height="250px" />
            ) : maintStatus.length === 0 ? (
              <p className="text-sm text-center text-(--app-color-text-muted) py-12">No maintenance records.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={maintStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {maintStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 📄 hidden print:block A4 Single Page Corporate PDF Report */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="hidden print:block mx-auto bg-white text-slate-800 font-sans p-10 max-w-[210mm] min-h-[297mm] text-sm leading-relaxed border border-slate-300 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#0f5f73] pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0f5f73] uppercase">AssetFlow</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">OPERATIONAL INVENTORY SUMMARY</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold">Security: INTERNAL ONLY</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Exec Summary */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Executive Summary</h2>
          <p className="text-slate-600 text-xs">
            This document outlines the operational status of physical capital assets registered within the organizational directories. Live database analytics are summarized below, confirming deployment distributions, audit compliance, and maintenance logs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deploy Rate</span>
            <span className="block text-2xl font-black text-[#0f5f73] mt-1">{utilization?.utilizationRate || 0}%</span>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Assets</span>
            <span className="block text-2xl font-black text-slate-800 mt-1">{utilization?.total || 0}</span>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Maint.</span>
            <span className="block text-2xl font-black text-amber-600 mt-1">{auditSummary?.missingItems || 0}</span>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Open Audits</span>
            <span className="block text-2xl font-black text-slate-800 mt-1">{auditSummary?.openAudits || 0}</span>
          </div>
        </div>

        {/* Distributions */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-1">Asset Status Breakdown</h3>
            <table className="w-full text-xs">
              <tbody>
                {assetStatus.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600 capitalize font-medium">{STATUS_LABELS[item.status] || item.status}</td>
                    <td className="py-2 text-right font-bold text-slate-800">{item.count} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-1">Deployments by Department</h3>
            <table className="w-full text-xs">
              <tbody>
                {deptDist.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600 font-medium">{item.department || 'Unassigned'}</td>
                    <td className="py-2 text-right font-bold text-slate-800">{item.count} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit compliance notes */}
        <div className="border border-slate-100 rounded-xl p-4 mb-12 text-xs bg-slate-50/50">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
            <CheckSquare className="h-4 w-4 text-[#0f5f73]" /> Audit Reconciliation Statement
          </h4>
          <p className="text-slate-600">
            This verification cycle lists {auditSummary?.verifiedItems || 0} items as reconciled and verified. A total of {auditSummary?.missingItems || 0} discrepancies have been logged by auditors. All missing items are flagged as lost upon cycle closure in accordance with internal compliance standards.
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-auto pt-12 border-t border-slate-200">
          <div className="space-y-4">
            <div className="h-[1px] bg-slate-300 w-full" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Asset Manager Representative</p>
              <p className="text-[10px] text-slate-400">Date Signed: ____ / ____ / ________</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-[1px] bg-slate-300 w-full" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Compliance / Auditor Signature</p>
              <p className="text-[10px] text-slate-400">Date Signed: ____ / ____ / ________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
