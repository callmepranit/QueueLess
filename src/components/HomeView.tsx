/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Ticket,
  Clock,
  Bell,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  Building2,
  Users2,
  CheckCircle2,
} from 'lucide-react';
import { SERVICE_CONFIGS, INITIAL_SERVICES } from '../utils/predictionEngine';

export const HomeView: React.FC = () => {
  const { setCurrentTab, setCurrentRole, tokens, counters, activeToken } = useQueue();

  const waitingCount = tokens.filter((t) => t.status === 'waiting').length;
  const inServiceCount = tokens.filter((t) => t.status === 'in_service').length;
  const activeCountersCount = counters.filter((c) => c.isAvailable).length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-slate-200 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Intelligent Campus Queue Management System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto" style={{ textWrap: 'balance' }}>
            Your Time Matters. <br className="hidden sm:inline" />
            <span className="text-cyan-400">Skip the Physical Queue.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            QueueLess replaces crowded physical lobbies with intelligent virtual queues. Join from your phone or kiosk, receive a digital token, see accurate wait-time predictions, and return exactly when your counter is ready.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentTab('join')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Join a Queue Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setCurrentTab('my-token')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{activeToken ? `Track Token (${activeToken.tokenNumber})` : 'Track My Token'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentRole('staff');
                setCurrentTab('staff');
              }}
              className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-lg border border-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Staff Dashboard Demo</span>
            </button>
          </div>

          {/* Live System Glance Strip */}
          <div className="pt-8 max-w-3xl mx-auto grid grid-cols-3 gap-3 sm:gap-6 border-t border-slate-800/80">
            <div className="text-center p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                {waitingCount}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Students Waiting</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 tabular-nums">
                {inServiceCount}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Currently In Service</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
                {activeCountersCount} / {counters.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Active Service Counters</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Flow Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-700">Simple Process</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">How QueueLess Works</h2>
          <p className="text-sm text-slate-600 mt-2">
            Eliminating physical crowding and standing in line in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-base mb-4">
              01
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Select a Service</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose your department service: Document Verification, Certificate Requests, Fee Enquiries, or Admissions.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-base mb-4">
              02
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Receive Digital Token</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instantly receive a unique sequential token (e.g., Q104) with real-time queue position and active counter data.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-base mb-4">
              03
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Track & Return on Time</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monitor estimated wait times on your device. Receive in-app turn alerts and proceed only when your counter calls you.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-700">Intelligent Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Core System Capabilities</h2>
          <p className="text-sm text-slate-600 mt-2">
            Designed for transparent administrative operations and stress-free student experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex gap-4">
            <div className="w-11 h-11 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">Baseline Waiting-Time Prediction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Applies the project's mathematical waiting model:
                <code className="block mt-1 p-1.5 bg-slate-100 rounded text-xs font-mono text-slate-800">
                  Estimated Wait = ceil((Customers Ahead × Avg Service Min) / Active Counters)
                </code>
                Automatically re-computes whenever counters go offline or tokens are served.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">Live Queue & Display Board</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A public status display showing every active service, current serving counters, upcoming tokens, and status classifications (Turn Approaching, Moderate, Busy).
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">Smart In-App Notification Center</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Triggers non-duplicating turn alerts when wait times fall below 5 minutes or when counter availability shifts unexpectedly.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">Operational Analytics & MAE Evaluation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Measures actual versus predicted service durations, computing Mean Absolute Error (MAE) to evaluate queue prediction reliability over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* College Administration Scenario Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-xl bg-slate-900 text-white border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Primary Demonstration Scenario</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">College Administration Office</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Students frequently face long lines during admissions, exam registrations, and certificate distributions. QueueLess structures these student inquiries across dedicated service counters.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {INITIAL_SERVICES.map((s) => (
                  <div key={s} className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                    <span className="font-medium text-slate-200 block truncate">{s}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">
                      ~{SERVICE_CONFIGS[s].defaultAvgMinutes} min avg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 space-y-3">
              <button
                onClick={() => setCurrentTab('join')}
                className="w-full px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors cursor-pointer text-center"
              >
                Join Demonstration Queue
              </button>
              <button
                onClick={() => {
                  setCurrentRole('staff');
                  setCurrentTab('staff');
                }}
                className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-sm border border-slate-700 transition-colors cursor-pointer text-center"
              >
                Open Staff Console
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notice / Disclaimer Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-900">Academic Prototype Notice & Estimation Disclaimer:</span>
            <p>
              QueueLess is an interactive college capstone prototype. All waiting times are baseline estimates calculated using current counter availability and historical service averages. Unforeseen student document complexities may adjust actual waiting times. Data is persisted locally in your browser session for presentation demonstration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
