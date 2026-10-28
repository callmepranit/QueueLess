/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ServiceType, TokenStatus, Token, Counter } from '../types/queue';
import {
  SERVICE_CONFIGS,
  INITIAL_SERVICES,
  getQueueStatusClassification,
} from '../utils/predictionEngine';
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  PhoneCall,
  Power,
  RotateCw,
  Search,
  Filter,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Calculator,
  UserPlus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const {
    tokens,
    counters,
    callNextToken,
    completeToken,
    cancelToken,
    markTokenMissed,
    toggleCounterAvailability,
    refreshQueue,
    resetDemoData,
    seedSampleStudents,
    lastUpdated,
    setActiveTokenId,
    setCurrentTab,
  } = useQueue();

  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showResetDialog, setShowResetDialog] = useState(false);

  // College presentation formula testing sandbox state
  const [sandboxAhead, setSandboxAhead] = useState(6);
  const [sandboxDuration, setSandboxDuration] = useState(5);
  const [sandboxCounters, setSandboxCounters] = useState(2);

  // KPI Calculations
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const inServiceTokens = tokens.filter((t) => t.status === 'in_service');
  const completedTokens = tokens.filter((t) => t.status === 'completed');
  const cancelledOrMissed = tokens.filter(
    (t) => t.status === 'cancelled' || t.status === 'missed'
  );
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
    if (serviceFilter !== 'All' && t.serviceType !== serviceFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
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

  // Calculate sandbox formula result: ceil((Ahead * Duration) / Counters)
  const sandboxCalculatedWait =
    sandboxCounters <= 0
      ? 0
      : sandboxAhead === 0
      ? 0
      : Math.ceil((sandboxAhead * sandboxDuration) / sandboxCounters);

  const sandboxClassification = getQueueStatusClassification(
    sandboxCalculatedWait,
    sandboxCounters <= 0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Staff & Counter Operations
            </h1>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-[11px] font-bold">
              Administrator Console
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Dispatch waiting students, control counter availability, monitor queues, and test system prediction formulas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshQueue}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Recalculate Queues</span>
          </button>

          <button
            onClick={() => setShowResetDialog(true)}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Waiting</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {waitingTokens.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Eligible in line</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">In Service</span>
          <span className="text-2xl font-bold font-mono text-cyan-700 mt-1 block tabular-nums">
            {inServiceTokens.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">At service desks</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Completed Today</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block tabular-nums">
            {completedTokens.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Tokens processed</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Cancelled / Missed</span>
          <span className="text-2xl font-bold font-mono text-slate-600 mt-1 block tabular-nums">
            {cancelledOrMissed.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Released spots</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Active Counters</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block tabular-nums">
            {activeCounters.length} / {counters.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Operating desks</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Avg Wait Estimate</span>
          <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block tabular-nums">
            {avgEstimatedWait}m
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Current system pace</span>
        </div>
      </div>

      {/* College Presentation Fast Demo Controls (Section 13) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wide text-white">
              College Presentation Simulation Controls
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Simulate real-time load shifts & formula verification
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => seedSampleStudents(5)}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Adds 5 new students to demonstrate queue progression"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+5 Sample Students</span>
          </button>

          {/* Simulate Counter 2 toggle to demonstrate wait time change */}
          <button
            onClick={() => toggleCounterAvailability('C2')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle Counter 2 online/offline to observe immediate wait estimate recalculations"
          >
            <Power className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Toggle Counter 2 ({counters.find((c) => c.id === 'C2')?.isAvailable ? 'Go Offline' : 'Reactivate'})
            </span>
          </button>

          {/* Quick Serve & Complete on Counter 1 */}
          <button
            onClick={() => {
              const c1 = counters.find((c) => c.id === 'C1');
              if (c1?.currentTokenId) {
                completeToken(c1.currentTokenId, 'C1');
              } else {
                callNextToken('C1');
              }
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Counter 1: Step Next / Complete</span>
          </button>

          <button
            onClick={() => setCurrentTab('join')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Issue Student Token Directly</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          Use these one-click triggers during your demonstration to show evaluators how QueueLess dynamically adjusts queue estimates when counters go offline or when new students enter the system.
        </p>
      </div>

      {/* Service Counter Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-700" />
            <span>Service Counter Management (3 Desks)</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click &quot;Call Next&quot; or toggle availability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {counters.map((counter) => {
            const currentServingToken = tokens.find((t) => t.id === counter.currentTokenId);

            // Eligible waiting tokens for this counter's services
            const eligibleWaiting = tokens.filter(
              (t) => t.status === 'waiting' && counter.assignedServices.includes(t.serviceType)
            );

            return (
              <div
                key={counter.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  counter.isAvailable
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                {/* Counter Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-base">{counter.name}</span>
                    <span className="text-slate-400 text-xs ml-2 font-mono">
                      ({counter.totalServedToday} served)
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCounterAvailability(counter.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      counter.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    }`}
                    title={counter.isAvailable ? 'Click to make counter offline' : 'Click to reactivate counter'}
                  >
                    <Power className="w-3 h-3" />
                    <span>{counter.isAvailable ? 'Active' : 'Offline'}</span>
                  </button>
                </div>

                {/* Assigned Services */}
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700 block">Assigned Services:</span>
                  <div className="flex flex-wrap gap-1">
                    {counter.assignedServices.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Token Serving Area */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs text-slate-500 font-medium block">
                    Currently In Service:
                  </span>

                  {currentServingToken ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono font-bold text-cyan-700">
                          {currentServingToken.tokenNumber}
                        </span>
                        <span className="text-xs text-slate-600 truncate max-w-[130px]">
                          {currentServingToken.customerName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentServingToken.serviceType}
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => completeToken(currentServingToken.id, counter.id)}
                          className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Service</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-1 flex items-center justify-between">
                      <span>No token currently being served.</span>
                      <span className="font-mono text-[11px] text-slate-400">Idle</span>
                    </div>
                  )}
                </div>

                {/* Counter Actions */}
                <div className="pt-1">
                  <button
                    disabled={!counter.isAvailable || !!counter.currentTokenId || eligibleWaiting.length === 0}
                    onClick={() => callNextToken(counter.id)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>
                      Call Next Waiting ({eligibleWaiting.length} in line)
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Token Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700" />
              <span>Token Dispatch & Queue Registry</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Directly call, mark in service, conclude, or cancel tokens.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token / student..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Service filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="All">All Services</option>
              {INITIAL_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="in_service">In Service</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4 text-center">Pos / Ahead</th>
                  <th className="py-3 px-4 text-right">Estimated Wait</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Desk</th>
                  <th className="py-3 px-4 text-right">Staff Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      No tokens match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((token) => {
                    const isWaiting = token.status === 'waiting';
                    const isInService = token.status === 'in_service';

                    return (
                      <tr key={token.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                          {token.tokenNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-800">
                          <div>{token.customerName}</div>
                          {token.notes && (
                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-[150px]">
                              {token.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="truncate max-w-[140px] block">{token.serviceType}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {isWaiting ? `#${token.queuePosition} (${token.customersAhead} ahead)` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {isWaiting ? `${token.estimatedWaitMinutes} min` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] capitalize font-medium ${
                              isInService
                                ? 'bg-cyan-100 text-cyan-800 font-semibold'
                                : isWaiting
                                ? 'bg-slate-100 text-slate-800'
                                : token.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {token.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {token.assignedCounterName || '—'}
                        </td>

                        {/* Staff Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isWaiting && (
                              <>
                                <button
                                  onClick={() => {
                                    // Assign to Counter 1, 2, or 3 based on eligibility
                                    const availableDesk = counters.find(
                                      (c) =>
                                        c.isAvailable &&
                                        !c.currentTokenId &&
                                        c.assignedServices.includes(token.serviceType)
                                    );
                                    if (availableDesk) {
                                      callNextToken(availableDesk.id, token.serviceType);
                                    } else {
                                      // Force call on first active desk that can serve
                                      const anyActive = counters.find(
                                        (c) =>
                                          c.isAvailable && c.assignedServices.includes(token.serviceType)
                                      );
                                      if (anyActive) {
                                        callNextToken(anyActive.id, token.serviceType);
                                      } else {
                                        alert(
                                          'No active counters are currently operating for this service.'
                                        );
                                      }
                                    }
                                  }}
                                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                                  title="Dispatch to available desk"
                                >
                                  Serve
                                </button>

                                <button
                                  onClick={() => markTokenMissed(token.id)}
                                  className="px-2 py-1 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded text-[11px] cursor-pointer"
                                  title="Mark student missed"
                                >
                                  Missed
                                </button>

                                <button
                                  onClick={() => cancelToken(token.id)}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] cursor-pointer"
                                  title="Cancel token"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {isInService && (
                              <button
                                onClick={() => completeToken(token.id, token.assignedCounterId)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Complete
                              </button>
                            )}

                            {(token.status === 'completed' ||
                              token.status === 'cancelled' ||
                              token.status === 'missed') && (
                              <span className="text-[11px] text-slate-400 font-mono">Archived</span>
                            )}
                          </div>
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

      {/* Mathematical Formula Verification Sandbox (Acceptance Tests 3, 4, 5) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Calculator className="w-5 h-5 text-cyan-600" />
            <span>AI / Baseline Waiting-Time Formula Testing Sandbox</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Directly test Acceptance Tests 3, 4, 5 & 6
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The baseline project report formula is:{' '}
          <code className="px-2 py-0.5 rounded bg-slate-100 font-mono text-cyan-800 font-bold">
            Estimated Wait = ceil((Customers Ahead × Average Service Minutes) / Active Counters)
          </code>
          . Adjust the sliders below to verify the exact mathematical requirements live:
        </p>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Customers Ahead */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Customers Ahead:</span>
              <span className="font-mono text-cyan-700 text-base font-bold tabular-nums">
                {sandboxAhead}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              value={sandboxAhead}
              onChange={(e) => setSandboxAhead(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 (next)</span>
              <span>6 (test value)</span>
              <span>15</span>
            </div>
          </div>

          {/* Average Service Duration */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Avg Duration (Minutes):</span>
              <span className="font-mono text-cyan-700 text-base font-bold tabular-nums">
                {sandboxDuration}m
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={sandboxDuration}
              onChange={(e) => setSandboxDuration(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1m</span>
              <span>5m (Doc Verif)</span>
              <span>12m</span>
            </div>
          </div>

          {/* Active Counters */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Active Counters:</span>
              <span className="font-mono text-cyan-700 text-base font-bold tabular-nums">
                {sandboxCounters}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              value={sandboxCounters}
              onChange={(e) => setSandboxCounters(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 (Offline)</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Real-time Calculation Result Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Calculated Outcome
            </span>
            <div className="font-mono text-cyan-300 text-xs sm:text-sm">
              ceil(({sandboxAhead} ahead × {sandboxDuration}m) / {sandboxCounters || '0 (offline)'}) ={' '}
              <span className="text-white font-bold text-base sm:text-lg">
                {sandboxCounters <= 0 ? 'Offline (Cannot divide by 0)' : `${sandboxCalculatedWait} minutes`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Classification:</span>
              <span
                className={`font-semibold text-sm px-2.5 py-0.5 rounded font-mono ${
                  sandboxClassification === 'Turn Approaching'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : sandboxClassification === 'Moderate Wait'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                {sandboxClassification}
              </span>
            </div>
          </div>
        </div>

        {/* Preset quick test buttons for Acceptance Tests */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium mr-1">Project Test Presets:</span>
          <button
            onClick={() => {
              setSandboxAhead(6);
              setSandboxDuration(5);
              setSandboxCounters(1);
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono cursor-pointer border border-slate-200"
          >
            Test 3: 6 ahead, 5m, 1 counter = 30 min
          </button>
          <button
            onClick={() => {
              setSandboxAhead(6);
              setSandboxDuration(5);
              setSandboxCounters(2);
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono cursor-pointer border border-slate-200"
          >
            Test 5: 6 ahead, 5m, 2 counters = 15 min
          </button>
          <button
            onClick={() => {
              setSandboxAhead(6);
              setSandboxDuration(5);
              setSandboxCounters(3);
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono cursor-pointer border border-slate-200"
          >
            Test 4: 6 ahead, 5m, 3 counters = 10 min
          </button>
          <button
            onClick={() => {
              setSandboxAhead(0);
              setSandboxDuration(5);
              setSandboxCounters(2);
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono cursor-pointer border border-slate-200"
          >
            0 Ahead = 0 min
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Demo State?</h3>
                <p className="text-xs text-slate-600">Restores default initial demo tokens.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              This will reset all tokens, service desks, and notification records back to initial college demonstration seeds. Any custom tokens added during this session will be cleared.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowResetDialog(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Yes, Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
