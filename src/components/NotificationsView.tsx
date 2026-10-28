/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { AppNotification } from '../types/queue';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Info,
  Filter,
  Ticket,
  ChevronRight,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    activeTokenId,
    setActiveTokenId,
    setCurrentTab,
  } = useQueue();

  const [filterType, setFilterType] = useState<string>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'my-token') return n.tokenId === activeTokenId;
    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'turn_approaching':
        return <Clock className="w-5 h-5 text-emerald-600" />;
      case 'in_service':
        return <Building2 className="w-5 h-5 text-cyan-600" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'counter_status':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'wait_change':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-cyan-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              In-App Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono text-xs font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real-time simulated turn alerts, wait-time updates, and desk announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-cyan-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white font-semibold text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'unread'
                ? 'bg-white font-semibold text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
          {activeTokenId && (
            <button
              onClick={() => setFilterType('my-token')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === 'my-token'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Token Alerts
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Auto-evaluates &le; 5 min turn alerts
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up. Notifications will appear here when your token advances or desk availability changes.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const timeAgo = formatTimeAgo(notif.createdAt);

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                }}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  notif.read
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-cyan-50/40 border-cyan-200 hover:border-cyan-300 shadow-xs'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    notif.type === 'turn_approaching'
                      ? 'bg-emerald-50 border-emerald-200'
                      : notif.type === 'in_service'
                      ? 'bg-cyan-50 border-cyan-200'
                      : notif.type === 'completed'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">
                        {notif.title}
                      </span>
                      {notif.tokenNumber && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
                          {notif.tokenNumber}
                        </span>
                      )}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                  {notif.tokenId && (
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notif.tokenId) {
                            setActiveTokenId(notif.tokenId);
                            setCurrentTab('my-token');
                          }
                        }}
                        className="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Token Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Production Architecture Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <span className="font-semibold text-slate-800 block">Demonstration System Notice:</span>
        <p>
          This in-app notification center demonstrates automated turn alert dispatching. When deployed to production, this notification pipeline interfaces seamlessly with SMS gateways (e.g. Twilio), Email delivery (e.g. SendGrid), and Web Push Notifications (Service Workers) without requiring user tab polling.
        </p>
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}
