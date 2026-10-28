/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQueue } from '../context/QueueContext';
import { Ticket, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentTab, setCurrentRole } = useQueue();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Queue<span className="text-cyan-400">Less</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              QueueLess: AI-Powered Smart Queue & Waiting-Time Management System. Built as a full-featured college academic prototype demonstrating virtual queues, baseline prediction modeling, and counter orchestration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <button
              onClick={() => setCurrentTab('home')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('join')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Join Queue
            </button>
            <button
              onClick={() => setCurrentTab('my-token')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              My Token
            </button>
            <button
              onClick={() => setCurrentTab('live-status')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Live Queue Status
            </button>
            <button
              onClick={() => {
                setCurrentRole('staff');
                setCurrentTab('staff');
              }}
              className="hover:text-cyan-400 transition-colors cursor-pointer text-cyan-400 font-medium"
            >
              Staff Dashboard Demo
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Analytics
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} QueueLess Capstone Prototype. Developed for Academic Demonstration.
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Baseline Estimation Engine · Local Persistence</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
