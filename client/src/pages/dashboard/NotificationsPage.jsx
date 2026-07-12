import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, History, Info } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Tabs from '../../components/Tabs.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';

  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.items || []);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    if (!isAdminOrManager) return;
    setLoadingLogs(true);
    try {
      const res = await api.get('/activity-logs');
      setLogs(res.data.items || []);
    } catch {
      toast.error('Failed to load activity logs.');
    } finally {
      setLoadingLogs(false);
    }
  }, [isAdminOrManager]);

  useEffect(() => {
    loadNotifications();
    loadLogs();
  }, [loadNotifications, loadLogs]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      toast.success('Notification marked as read.');
    } catch {
      toast.error('Failed to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to update notifications.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const logColumns = [
    {
      key: 'userName',
      label: 'User',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-(--app-color-text)">{v || 'System'}</p>
          {row.userEmail && <p className="text-xs text-(--app-color-text-muted)">{row.userEmail}</p>}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (v) => <span className="font-medium text-(--app-color-primary)">{v}</span>,
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (v, row) => (
        <span className="capitalize text-xs text-(--app-color-text-muted)">
          {v} ({row.entityId?.slice(0, 8) || 'N/A'})
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (v) => new Date(v).toLocaleString(),
    },
  ];

  const tabs = [
    {
      label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-(--app-color-text-muted)">Your Inbox</h4>
            {unreadCount > 0 && (
              <Button size="sm" variant="secondary" onClick={handleMarkAllRead}>
                <Check className="h-4 w-4 mr-1.5" /> Mark all read
              </Button>
            )}
          </div>
          {notifications.length === 0 && !loadingNotifs ? (
            <EmptyState
              icon={Bell}
              title="Inbox clean!"
              message="You have no notifications at this moment."
            />
          ) : (
            <div className="divide-y divide-(--app-color-border) rounded-xl border border-(--app-color-border) bg-white overflow-hidden shadow-sm">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between p-4 transition-colors ${
                    !n.read ? 'bg-(--app-color-primary-soft)/20' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${!n.read ? 'bg-(--app-color-primary)' : 'bg-transparent'}`} />
                      <h5 className="font-semibold text-sm text-(--app-color-text)">{n.title}</h5>
                      <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                        {n.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-(--app-color-text-muted) pl-4">{n.message}</p>
                    <p className="text-[10px] text-(--app-color-text-muted) pl-4">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <Button size="sm" variant="ghost" onClick={() => handleMarkRead(n.id)}>
                      <Check className="h-4 w-4 text-(--app-color-text-muted)" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isAdminOrManager) {
    tabs.push({
      label: 'System Activity Logs',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-(--app-color-text-muted)">Audit Trail</h4>
            <Button size="sm" variant="secondary" onClick={loadLogs}>
              Refresh logs
            </Button>
          </div>
          <div className="rounded-xl border border-(--app-color-border) bg-white overflow-hidden shadow-sm">
            <Table columns={logColumns} data={logs} isLoading={loadingLogs} emptyMessage="No activity logged yet." />
          </div>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs & Notifications"
        subtitle="Stay updated on recent events, asset assignments, and audit trails."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}
