/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ServiceType, Token } from '../types/queue';
import {
  SERVICE_CONFIGS,
  INITIAL_SERVICES,
  calculateEstimatedWait,
  getActiveCountersForService,
} from '../utils/predictionEngine';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  FileText,
  Building,
  HelpCircle,
} from 'lucide-react';

export const JoinQueueView: React.FC = () => {
  const { joinQueue, counters, tokens, setCurrentTab } = useQueue();

  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType>('Document Verification');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<Token | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your full student or customer name.');
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMsg('Name must be at least 2 characters long.');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('Please consent to receiving in-app demo queue notifications.');
      return;
    }

    // Check if counters are available for this service
    const activeCounters = getActiveCountersForService(selectedService, counters);
    if (activeCounters === 0) {
      setErrorMsg(
        `Notice: All counters for "${selectedService}" are currently offline. You may still join, but estimated waiting time cannot be calculated until a counter activates.`
      );
    }

    setIsSubmitting(true);

    // Controlled brief simulated delay to prevent double-clicks and show smooth submission state
    setTimeout(() => {
      try {
        const token = joinQueue(trimmedName, selectedService, contactInfo, notes);
        setCreatedToken(token);
        setIsSubmitting(false);
      } catch (err) {
        setErrorMsg('An unexpected error occurred while generating your token. Please retry.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleResetForm = () => {
    setCreatedToken(null);
    setCustomerName('');
    setContactInfo('');
    setNotes('');
    setErrorMsg(null);
  };

  // Preview metrics for the currently selected service
  const currentWaitingCount = tokens.filter(
    (t) => t.status === 'waiting' && t.serviceType === selectedService
  ).length;

  const previewPrediction = calculateEstimatedWait(
    currentWaitingCount,
    selectedService,
    counters
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Join a Service Queue
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Reserve your place in the virtual queue for college administrative offices. Receive a digital token and real-time wait estimation.
        </p>
      </div>

      {createdToken ? (
        /* Success Screen */
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Queue Token Generated!</h2>
              <p className="text-sm text-slate-600">
                You are registered in the virtual queue. Keep this token active on your device.
              </p>
            </div>
          </div>

          {/* Digital Token Ticket Preview */}
          <div className="p-6 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Digital Token</span>
                <div className="text-4xl font-extrabold font-mono text-cyan-400 mt-0.5">
                  {createdToken.tokenNumber}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Estimated Wait</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                  {createdToken.estimatedWaitMinutes} min
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Student Name</span>
                <span className="font-semibold text-slate-200 text-sm">{createdToken.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Service</span>
                <span className="font-semibold text-slate-200 text-sm truncate block">{createdToken.serviceType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Queue Position</span>
                <span className="font-semibold text-slate-200 text-sm">#{createdToken.queuePosition} in line</span>
              </div>
              <div>
                <span className="text-slate-400 block">Customers Ahead</span>
                <span className="font-semibold text-slate-200 text-sm">{createdToken.customersAhead} waiting</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setCurrentTab('my-token')}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>View & Track My Token</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setCurrentTab('live-status')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-sm transition-colors cursor-pointer"
            >
              View Live Queue Board
            </button>

            <button
              onClick={handleResetForm}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors cursor-pointer ml-auto"
            >
              Issue Another Token
            </button>
          </div>
        </div>
      ) : (
        /* Join Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Service Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                1. Select Administrative Service <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INITIAL_SERVICES.map((s) => {
                  const isSelected = selectedService === s;
                  const cfg = SERVICE_CONFIGS[s];
                  const serviceWaiting = tokens.filter(
                    (t) => t.status === 'waiting' && t.serviceType === s
                  ).length;
                  const activeCount = getActiveCountersForService(s, counters);

                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedService(s)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-sm text-slate-900">{s}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cfg.description}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                        <span>{serviceWaiting} waiting</span>
                        <span>·</span>
                        <span>{activeCount} active counter{activeCount === 1 ? '' : 's'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4 pt-2">
              <label className="block text-sm font-semibold text-slate-900">
                2. Student / Applicant Information
              </label>

              <div>
                <label htmlFor="customerName" className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="customerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Deshmukh"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactInfo" className="block text-xs font-medium text-slate-700 mb-1">
                  Email or Mobile Number (Optional for simulated notifications)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="contactInfo"
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. rahul.d@college.edu or 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-medium text-slate-700 mb-1">
                  Inquiry Purpose or Document Reference (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Seeking provisional degree certificate for campus placement"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span>
                  I consent to using this entered contact info for in-app demo alerts and waiting-time status updates.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Allocating Token...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    <span>Generate My Digital Token</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Dynamic Live Preview Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                  Live Queue Preview
                </span>
                <span className="text-xs text-slate-400">Current Load</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Selected Service</span>
                <span className="text-base font-semibold text-white block mt-0.5">
                  {selectedService}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="text-xs text-slate-400 block">Ahead in Queue</span>
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {currentWaitingCount}
                  </span>
                  <span className="text-[11px] text-slate-400 block">waiting now</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="text-xs text-slate-400 block">Active Counters</span>
                  <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                    {previewPrediction.activeCounters}
                  </span>
                  <span className="text-[11px] text-slate-400 block">serving this desk</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Projected Wait Time:</span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      previewPrediction.isServiceUnavailable
                        ? 'text-red-400'
                        : previewPrediction.estimatedWaitMinutes <= 5
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {previewPrediction.isServiceUnavailable
                      ? 'Offline'
                      : `~${previewPrediction.estimatedWaitMinutes} min`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Status: {previewPrediction.classification}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                <span className="text-slate-300 font-medium">Formula: </span>
                <span className="font-mono text-[10px] text-cyan-300 block">
                  ceil(({currentWaitingCount} ahead × {previewPrediction.averageServiceMinutes}m avg) / {previewPrediction.activeCounters || 1} counter{previewPrediction.activeCounters === 1 ? '' : 's'})
                </span>
              </div>
            </div>

            {/* Quick tips */}
            <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-semibold text-slate-800 block">Student Convenience Tips:</span>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Keep this browser tab open to receive audio/visual turn alerts.</li>
                <li>You can leave the immediate office lobby and return when the wait hits &le; 5 minutes.</li>
                <li>You can cancel your token at any time if your plans change.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
