/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Ticket,
  Clock,
  RotateCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Info,
  Search,
  ExternalLink,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  getActiveCountersForService,
  SERVICE_CONFIGS,
  getQueueStatusClassification,
} from '../utils/predictionEngine';

export const MyTokenView: React.FC = () => {
  const {
    tokens,
    counters,
    activeToken,
    activeTokenId,
    setActiveTokenId,
    cancelToken,
    refreshQueue,
    lastUpdated,
    setCurrentTab,
  } = useQueue();

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Filter token list for fast token switcher (waiting or in-service or completed)
  const availableTokens = tokens.slice().sort((a, b) => b.joinedAt - a.joinedAt);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const query = lookupQuery.trim().toUpperCase();
    if (!query) return;

    const found = tokens.find(
      (t) => t.tokenNumber.toUpperCase() === query || t.customerName.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setActiveTokenId(found.id);
      setLookupQuery('');
    } else {
      setLookupError(`Token "${query}" not found in current records. Please verify the token number.`);
    }
  };

  const currentToken = activeToken;

  // Active counters for this token's service
  const activeCountersCount = currentToken
    ? getActiveCountersForService(currentToken.serviceType, counters)
    : 0;

  const isServiceOffline = currentToken ? activeCountersCount === 0 : false;

  const statusLabel = currentToken
    ? getQueueStatusClassification(currentToken.estimatedWaitMinutes, isServiceOffline)
    : 'Moderate Wait';

  // Format joining time
  const formattedJoinedTime = currentToken
    ? new Date(currentToken.joinedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--';

  const formattedLastUpdated = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate progress estimation
  const totalInQueueForService = currentToken
    ? tokens.filter((t) => t.serviceType === currentToken.serviceType && t.status === 'waiting').length
    : 1;

  // Progress percentage (closer to 1 = higher progress)
  const progressPercent = currentToken
    ? currentToken.status === 'in_service' || currentToken.status === 'completed'
      ? 100
      : Math.min(
          95,
          Math.max(10, Math.round(((totalInQueueForService - currentToken.customersAhead) / (totalInQueueForService + 1)) * 100))
        )
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header and Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Digital Token
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time queue tracking, position monitoring, and waiting-time estimates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshQueue}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh queue estimates"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Refresh Status</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Updated: {formattedLastUpdated}
          </span>
        </div>
      </div>

      {/* Token Lookup & Fast Switcher Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Find another token (e.g. Q101, Q104, or Student Name)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Track Token
          </button>
        </form>

        {lookupError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {lookupError}
          </div>
        )}

        {/* Quick chip selector of active tokens in demo */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-500 font-medium mr-1">Demo Tokens:</span>
          {availableTokens.slice(0, 8).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTokenId(t.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                activeTokenId === t.id
                  ? 'bg-slate-900 text-cyan-300 font-bold border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t.tokenNumber} ({t.status})
            </button>
          ))}
        </div>
      </div>

      {!currentToken ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">No Active Token Selected</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Join a queue to receive a digital token, or select an existing token from the list above.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('join')}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Join a Queue</span>
          </button>
        </div>
      ) : (
        /* Digital Token Card */
        <div className="space-y-6">
          {/* Main Card with Deep Navy Framing */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {/* Top Navy Ribbon */}
            <div className="bg-slate-950 text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Digital Queue Pass
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-cyan-400 font-mono">Issued via QueueLess</span>
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-cyan-400 tracking-tight">
                  {currentToken.tokenNumber}
                </div>
                <div className="text-sm text-slate-300 font-medium pt-1">
                  {currentToken.customerName}
                  {currentToken.contactInfo && (
                    <span className="text-slate-500 ml-2 text-xs">({currentToken.contactInfo})</span>
                  )}
                </div>
              </div>

              {/* Status and Wait Time Pill Block */}
              <div className="sm:text-right space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wide border">
                  {currentToken.status === 'in_service' ? (
                    <span className="bg-cyan-900/60 text-cyan-300 border-cyan-700 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      In Service at {currentToken.assignedCounterName || 'Desk'}
                    </span>
                  ) : currentToken.status === 'completed' ? (
                    <span className="bg-emerald-950 text-emerald-400 border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Service Completed
                    </span>
                  ) : currentToken.status === 'cancelled' ? (
                    <span className="bg-slate-800 text-slate-400 border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Token Cancelled
                    </span>
                  ) : currentToken.status === 'missed' ? (
                    <span className="bg-red-950 text-red-400 border-red-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Marked Missed
                    </span>
                  ) : (
                    /* Waiting Token Status */
                    <span
                      className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 ${
                        statusLabel === 'Turn Approaching'
                          ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                          : statusLabel === 'Moderate Wait'
                          ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                          : statusLabel === 'Service Unavailable'
                          ? 'bg-red-900/60 text-red-300 border-red-700'
                          : 'bg-red-900/60 text-red-300 border-red-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {statusLabel}
                    </span>
                  )}
                </div>

                {currentToken.status === 'waiting' && (
                  <div>
                    <div className="text-xs text-slate-400">Estimated Waiting Time</div>
                    <div className="text-3xl font-mono font-bold text-white tabular-nums">
                      {isServiceOffline ? '--' : `${currentToken.estimatedWaitMinutes} min`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar for Waiting or In-Service */}
            <div className="bg-slate-100 h-2 w-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentToken.status === 'completed'
                    ? 'bg-emerald-500'
                    : currentToken.status === 'in_service'
                    ? 'bg-cyan-500'
                    : currentToken.estimatedWaitMinutes <= 5
                    ? 'bg-emerald-500'
                    : currentToken.estimatedWaitMinutes <= 15
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Token Body Details Grid */}
            <div className="p-6 sm:p-7 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-slate-500 block">Assigned Service</span>
                  <span className="font-semibold text-slate-900 text-sm block mt-0.5">
                    {currentToken.serviceType}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {SERVICE_CONFIGS[currentToken.serviceType]?.category || 'General'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Queue Position</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {currentToken.status === 'waiting' ? `#${currentToken.queuePosition}` : '—'}
                    </span>
                    {currentToken.status === 'waiting' && (
                      <span className="text-xs text-slate-500">
                        ({currentToken.customersAhead} ahead)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Active Counters</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold font-mono text-cyan-700">
                      {activeCountersCount}
                    </span>
                    <span className="text-xs text-slate-500">operating</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Registered At</span>
                  <span className="font-semibold text-slate-900 text-sm block mt-0.5 font-mono">
                    {formattedJoinedTime}
                  </span>
                </div>
              </div>

              {currentToken.notes && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-0.5">Reference Note:</span>
                  <span>{currentToken.notes}</span>
                </div>
              )}

              {/* Status Notice Callout */}
              {currentToken.status === 'waiting' && currentToken.estimatedWaitMinutes <= 5 && !isServiceOffline && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900 text-sm block">
                      Turn Approaching: Please Stay in the Service Area
                    </span>
                    <p className="mt-0.5">
                      Your wait time is under 5 minutes. Please be ready near the counters with your documents ready for verification.
                    </p>
                  </div>
                </div>
              )}

              {currentToken.status === 'waiting' && isServiceOffline && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-red-900 text-sm block">
                      Service Temporarily Offline
                    </span>
                    <p className="mt-0.5">
                      No active counters are currently operating for {currentToken.serviceType}. Your place in line is preserved. Wait estimates will resume immediately when staff reactivates a counter.
                    </p>
                  </div>
                </div>
              )}

              {currentToken.status === 'in_service' && (
                <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cyan-950 text-sm block">
                      Now Being Served at {currentToken.assignedCounterName || 'Desk'}
                    </span>
                    <p className="mt-0.5">
                      Please approach the designated counter. If you have any additional queries, inform the administrative staff officer.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(!showFormulaModal)}
                  className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>How is my waiting time calculated?</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentToken.status === 'waiting' && (
                    <button
                      type="button"
                      onClick={() => setShowCancelDialog(true)}
                      className="px-3.5 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Leave Queue / Cancel Token</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentTab('live-status')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    View Live Display
                  </button>
                </div>
              </div>

              {/* Formula Explainer Collapse / Card */}
              {showFormulaModal && (
                <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-cyan-400">
                      Baseline Queue Estimation Formula
                    </span>
                    <button
                      onClick={() => setShowFormulaModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 font-mono text-cyan-300 text-center">
                    Estimated Wait = ceil((Customers Ahead × Average Service Minutes) / Active Counters)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-400 block">Customers Ahead:</span>
                      <span className="font-mono text-white text-sm">
                        {currentToken.customersAhead}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Avg Duration:</span>
                      <span className="font-mono text-white text-sm">
                        {SERVICE_CONFIGS[currentToken.serviceType]?.defaultAvgMinutes || 5} min
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Active Counters:</span>
                      <span className="font-mono text-cyan-400 text-sm">
                        {activeCountersCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Estimated Result:</span>
                      <span className="font-mono text-emerald-400 text-sm">
                        {isServiceOffline ? 'Offline' : `${currentToken.estimatedWaitMinutes} min`}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Note: This is a verified mathematical model for academic queue management. Whenever another student is served or a counter activates/deactivates, the estimate dynamically recalculates.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Confirmation Dialog */}
          {showCancelDialog && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Cancel Queue Token?</h3>
                    <p className="text-xs text-slate-600">This action will release your place in line.</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  Are you sure you want to cancel token <strong className="font-mono text-slate-900">{currentToken.tokenNumber}</strong> for {currentToken.serviceType}? Customers waiting behind you will advance in the queue.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Keep My Spot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      cancelToken(currentToken.id);
                      setShowCancelDialog(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                  >
                    Yes, Cancel Token
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
