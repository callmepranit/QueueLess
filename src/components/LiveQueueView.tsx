/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ServiceType, TokenStatus } from '../types/queue';
import { INITIAL_SERVICES, getQueueStatusClassification } from '../utils/predictionEngine';
import {
  Clock,
  Users,
  Building2,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const LiveQueueView: React.FC = () => {
  const { tokens, counters, refreshQueue, lastUpdated, setActiveTokenId, setCurrentTab } = useQueue();

  const [selectedService, setSelectedService] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Top summary KPIs
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const inServiceTokens = tokens.filter((t) => t.status === 'in_service');
  const activeCounters = counters.filter((c) => c.isAvailable);

  const avgEstimatedWait =
    waitingTokens.length > 0
      ? Math.round(
          waitingTokens.reduce((acc, t) => acc + (t.estimatedWaitMinutes || 0), 0) /
            waitingTokens.length
        )
      : 0;

  // Filtered tokens
  const filteredTokens = tokens.filter((t) => {
    if (selectedService !== 'All' && t.serviceType !== selectedService) {
      return false;
    }
    if (selectedStatus === 'waiting' && t.status !== 'waiting') return false;
    if (selectedStatus === 'in_service' && t.status !== 'in_service') return false;
    if (selectedStatus === 'completed' && t.status !== 'completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.tokenNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.serviceType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formattedLastUpdated = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Live Queue Board
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time public status display of campus service desks and token progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshQueue}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Refresh Board</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            Updated: {formattedLastUpdated}
          </span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Waiting</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {waitingTokens.length}
          </div>
          <div className="text-[11px] text-slate-400">Students in virtual line</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Currently In Service</span>
            <Building2 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-700 tabular-nums">
            {inServiceTokens.length}
          </div>
          <div className="text-[11px] text-slate-400">At administrative counters</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Counters</span>
            <span className="text-emerald-600 font-mono text-xs">● Live</span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600 tabular-nums">
            {activeCounters.length} / {counters.length}
          </div>
          <div className="text-[11px] text-slate-400">Counters operating now</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Avg Estimated Wait</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-600 tabular-nums">
            {avgEstimatedWait} min
          </div>
          <div className="text-[11px] text-slate-400">Across all waiting desks</div>
        </div>
      </div>

      {/* Service Counter Status Bar */}
      <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 pb-2">
          <span>Active Campus Service Desks</span>
          <span>Desk Availability & Workload</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {counters.map((c) => {
            const currentServingToken = tokens.find((t) => t.id === c.currentTokenId);

            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                  c.isAvailable
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-slate-950/90 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{c.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      c.isAvailable
                        ? c.currentTokenId
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {c.isAvailable ? (c.currentTokenId ? 'Serving' : 'Available') : 'Offline'}
                  </span>
                </div>

                <div className="text-slate-400 text-[11px] line-clamp-1">
                  {c.assignedServices.join(', ')}
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Token:</span>
                  {currentServingToken ? (
                    <span className="font-mono font-bold text-cyan-400">
                      {currentServingToken.tokenNumber} ({currentServingToken.customerName})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono">None</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token (e.g. Q104, Aarav)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All Services</option>
            {INITIAL_SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('waiting')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'waiting'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting ({waitingTokens.length})
            </button>
            <button
              onClick={() => setSelectedStatus('in_service')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'in_service'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Service ({inServiceTokens.length})
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'completed'
                  ? 'bg-white font-medium text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Live Token Table (Section 9) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Token Number</th>
                <th className="py-3 px-4">Student / Customer</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4 text-center">Queue Position</th>
                <th className="py-3 px-4 text-right">Estimated Wait</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Token State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No tokens match the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((token) => {
                  const isWaiting = token.status === 'waiting';
                  const classification = isWaiting
                    ? getQueueStatusClassification(token.estimatedWaitMinutes, false)
                    : null;

                  return (
                    <tr
                      key={token.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Token Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        {token.tokenNumber}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4 text-slate-800">
                        <div>{token.customerName}</div>
                        {token.contactInfo && (
                          <div className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]">
                            {token.contactInfo}
                          </div>
                        )}
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="truncate max-w-[160px] block">
                          {token.serviceType}
                        </span>
                      </td>

                      {/* Queue Position */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {isWaiting ? (
                          <span className="font-bold text-slate-900">
                            #{token.queuePosition}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Estimated Wait */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {isWaiting ? (
                          <span
                            className={`font-bold ${
                              token.estimatedWaitMinutes <= 5
                                ? 'text-emerald-600'
                                : token.estimatedWaitMinutes <= 15
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {token.estimatedWaitMinutes} min
                          </span>
                        ) : token.status === 'in_service' ? (
                          <span className="text-cyan-600 font-medium">In Desk</span>
                        ) : token.status === 'completed' ? (
                          <span className="text-slate-400">
                            {token.actualWaitMinutes ? `${token.actualWaitMinutes}m actual` : 'Done'}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status Classification */}
                      <td className="py-3.5 px-4">
                        {classification ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 ${
                              classification === 'Turn Approaching'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : classification === 'Moderate Wait'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {classification}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Token State */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] capitalize font-medium ${
                            token.status === 'in_service'
                              ? 'bg-cyan-100 text-cyan-800 font-semibold'
                              : token.status === 'waiting'
                              ? 'bg-slate-100 text-slate-800'
                              : token.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {token.status === 'in_service'
                            ? `In Service (${token.assignedCounterName || 'Desk'})`
                            : token.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTokenId(token.id);
                            setCurrentTab('my-token');
                          }}
                          className="px-2.5 py-1 text-xs text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
