/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { NavigationTab, DemoRole } from '../types/queue';
import {
  Ticket,
  Bell,
  Users,
  Clock,
  LayoutDashboard,
  BarChart3,
  Home,
  PlusCircle,
  Menu,
  X,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    currentRole,
    setCurrentRole,
    notifications,
    activeToken,
  } = useQueue();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'join', label: 'Join Queue', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'my-token', label: 'My Token', icon: <Ticket className="w-4 h-4" /> },
    { id: 'live-status', label: 'Live Queue', icon: <Clock className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <span className="relative inline-flex items-center">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full" />
          )}
        </span>
      ),
    },
    { id: 'staff', label: 'Staff Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-slate-100">
      {/* Strict 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                Queue<span className="text-cyan-400">Less</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  isActive
                    ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.id === 'notifications' && unreadCount > 0 && (
                  <span className="ml-0.5 text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 rounded px-1.5 py-0.2 font-mono tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Demo Role Switcher & Active Token Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Token shortcut if user has one */}
          {activeToken && (
            <button
              onClick={() => handleNavClick('my-token')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-500 transition-colors whitespace-nowrap"
              title="View your current token"
            >
              <span className="text-slate-400">Token:</span>
              <span className="font-mono font-bold text-cyan-400">{activeToken.tokenNumber}</span>
              <span className="text-slate-400">({activeToken.estimatedWaitMinutes}m)</span>
            </button>
          )}

          {/* Demonstration Role Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setCurrentRole('customer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                currentRole === 'customer'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Student / Customer view"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('staff');
                if (currentTab === 'home' || currentTab === 'join') {
                  setCurrentTab('staff');
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                currentRole === 'staff'
                  ? 'bg-slate-700 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Staff / Administrator view"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Demo</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.id === 'notifications' && unreadCount > 0 && (
                  <span className="text-xs bg-cyan-900 text-cyan-300 border border-cyan-700 rounded px-2 py-0.5 font-mono">
                    {unreadCount} unread
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Role: {currentRole === 'customer' ? 'Customer' : 'Staff Admin'}</span>
            <span className="text-cyan-400">College Demo Mode</span>
          </div>
        </div>
      )}
    </header>
  );
};
