/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQueue } from '../context/QueueContext';
import { INITIAL_SERVICES, SERVICE_CONFIGS } from '../utils/predictionEngine';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  HelpCircle,
  FileCheck,
  Percent,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tokens, counters, maeReport } = useQueue();

  // Tokens count by service
  const serviceStats = INITIAL_SERVICES.map((service) => {
    const serviceTokens = tokens.filter((t) => t.serviceType === service);
    const waiting = serviceTokens.filter((t) => t.status === 'waiting').length;
    const completed = serviceTokens.filter((t) => t.status === 'completed').length;
    const inService = serviceTokens.filter((t) => t.status === 'in_service').length;
    const total = serviceTokens.length;

    const waitingTokens = serviceTokens.filter((t) => t.status === 'waiting');
    const avgWait =
      waitingTokens.length > 0
        ? Math.round(
            waitingTokens.reduce((sum, t) => sum + (t.estimatedWaitMinutes || 0), 0) /
              waitingTokens.length
          )
        : SERVICE_CONFIGS[service].defaultAvgMinutes;

    return {
      service,
      waiting,
      completed,
      inService,
      total,
      avgWait,
      defaultDuration: SERVICE_CONFIGS[service].defaultAvgMinutes,
    };
  });

  const maxQueueLength = Math.max(1, ...serviceStats.map((s) => s.waiting));
  const maxCompleted = Math.max(1, ...serviceStats.map((s) => s.completed));
  const maxWaitTime = Math.max(1, ...serviceStats.map((s) => s.avgWait));

  // Overall status distribution
  const waitingTotal = tokens.filter((t) => t.status === 'waiting').length;
  const inServiceTotal = tokens.filter((t) => t.status === 'in_service').length;
  const completedTotal = tokens.filter((t) => t.status === 'completed').length;
  const cancelledTotal = tokens.filter((t) => t.status === 'cancelled').length;
  const missedTotal = tokens.filter((t) => t.status === 'missed').length;
  const grandTotal = Math.max(1, tokens.length);

  // Counter utilization
  const totalCountersServed = counters.reduce((sum, c) => sum + c.totalServedToday, 0) || 1;

  // Simulated Hourly Queue Traffic (typical campus office day)
  const hourlyTraffic = [
    { hour: '09:00', students: 8, load: 'Moderate' },
    { hour: '10:00', students: 19, load: 'Peak' },
    { hour: '11:00', students: 24, load: 'High Peak' },
    { hour: '12:00', students: 16, load: 'Moderate' },
    { hour: '13:00', students: 7, load: 'Low' },
    { hour: '14:00', students: 21, load: 'Peak' },
    { hour: '15:00', students: 18, load: 'Moderate' },
    { hour: '16:00', students: 9, load: 'Closing' },
  ];
  const maxHourly = Math.max(...hourlyTraffic.map((h) => h.students));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Queue Performance & Analytics
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Workload distributions, counter service throughput, and prediction accuracy evaluation.
        </p>
      </div>

      {/* Prediction Evaluation Panel (Section 12: MAE Evaluation) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
              <h2 className="text-base font-bold text-slate-900">
                Waiting-Time Prediction Accuracy Evaluation (MAE)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between predicted wait time and actual wait time for completed student tokens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Mean Absolute Error (MAE):</span>
            {maeReport.meanAbsoluteError !== null ? (
              <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-sm rounded-lg tabular-nums">
                {maeReport.meanAbsoluteError} min
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-100 text-slate-500 font-mono text-xs rounded-lg">
                N/A
              </span>
            )}
          </div>
        </div>

        {/* Mathematical Formulas Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5">Absolute Prediction Error:</span>
            <code>Absolute Error = abs(Predicted Wait − Actual Wait)</code>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5">Mean Absolute Error:</span>
            <code>MAE = Sum of Absolute Errors / Number of Evaluated Tokens</code>
          </div>
        </div>

        {/* Evaluation Table */}
        {maeReport.evaluatedTokensCount === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <p className="text-sm font-medium text-slate-700">Insufficient data for evaluation.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No completed tokens have recorded both predicted and actual waiting timestamps yet. Complete waiting tokens in the Staff Dashboard to populate evaluation records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Token</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4 text-right">Predicted Wait</th>
                  <th className="py-2.5 px-4 text-right">Actual Wait</th>
                  <th className="py-2.5 px-4 text-right">Absolute Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {maeReport.evaluations.map((tok) => (
                  <tr key={tok.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {tok.tokenNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">{tok.customerName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{tok.serviceType}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {tok.estimatedWaitMinutes}m
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {tok.actualWaitMinutes}m
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-cyan-800">
                      {tok.absoluteError}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-[11px] text-slate-400">
          Source: Calculated directly from application session records. No fabricated values.
        </div>
      </div>

      {/* Two Column Grid: Waiting Queue Length by Service & Average Wait Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waiting Queue Length by Service */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>Current Waiting Students by Service</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Demo State</span>
          </div>

          <div className="space-y-4">
            {serviceStats.map((item) => {
              const widthPct = Math.round((item.waiting / maxQueueLength) * 100);

              return (
                <div key={item.service} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.service}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.waiting} waiting
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.waiting > 0 ? 8 : 0, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated Waiting Time by Service */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Average Waiting Time by Service</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">In Minutes</span>
          </div>

          <div className="space-y-4">
            {serviceStats.map((item) => {
              const widthPct = Math.round((item.avgWait / (maxWaitTime || 1)) * 100);

              return (
                <div key={item.service} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.service}</span>
                    <span className="font-mono font-bold text-amber-700">
                      ~{item.avgWait} min (avg service: {item.defaultDuration}m)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Counter Throughput & Token Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Counter Utilization */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Counter Workload & Throughput</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Tokens Processed</span>
          </div>

          <div className="space-y-4">
            {counters.map((c) => {
              const pct = Math.round((c.totalServedToday / totalCountersServed) * 100);

              return (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {c.totalServedToday} students served ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Services: {c.assignedServices.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Status Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-600" />
              <span>Token Status Distribution</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total: {tokens.length}</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                Waiting in Queue
              </span>
              <span className="font-mono font-bold">{waitingTotal} ({Math.round((waitingTotal / grandTotal) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Currently In Service
              </span>
              <span className="font-mono font-bold">{inServiceTotal} ({Math.round((inServiceTotal / grandTotal) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="font-mono font-bold">{completedTotal} ({Math.round((completedTotal / grandTotal) * 100)}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                Cancelled / Missed
              </span>
              <span className="font-mono font-bold">{cancelledTotal + missedTotal} ({Math.round(((cancelledTotal + missedTotal) / grandTotal) * 100)}%)</span>
            </div>

            {/* Combined Segment Bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 mt-4">
              <div
                className="bg-slate-800 h-full"
                style={{ width: `${(waitingTotal / grandTotal) * 100}%` }}
                title="Waiting"
              />
              <div
                className="bg-cyan-500 h-full"
                style={{ width: `${(inServiceTotal / grandTotal) * 100}%` }}
                title="In Service"
              />
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(completedTotal / grandTotal) * 100}%` }}
                title="Completed"
              />
              <div
                className="bg-red-400 h-full"
                style={{ width: `${((cancelledTotal + missedTotal) / grandTotal) * 100}%` }}
                title="Cancelled/Missed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Traffic Chart (Clearly labeled as Simulated Demo Data) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span>Campus Queue Traffic Over Time (Busy Period Indicators)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated campus administration office load across typical academic working hours.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono self-start sm:self-auto">
            Simulated Demo Data
          </span>
        </div>

        <div className="pt-4 grid grid-cols-8 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 pb-2">
          {hourlyTraffic.map((hour) => {
            const heightPct = Math.round((hour.students / maxHourly) * 100);
            const isPeak = hour.students >= 20;

            return (
              <div key={hour.hour} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {hour.students}
                </span>
                <div
                  className={`w-full rounded-t transition-all ${
                    isPeak
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-cyan-600 hover:bg-cyan-700'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] sm:text-xs text-slate-500 font-mono whitespace-nowrap">
                  {hour.hour}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600" />
              <span>Normal Traffic</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Peak Office Hours (10:00 - 12:00, 14:00)</span>
            </span>
          </div>
          <span className="text-[11px] font-mono">Peak: 24 students/hour</span>
        </div>
      </div>
    </div>
  );
};
