/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceType =
  | 'Document Verification'
  | 'Certificate Request'
  | 'Fee Enquiry'
  | 'Admission Assistance'
  | 'General Administration';

export interface ServiceConfig {
  id: ServiceType;
  name: string;
  defaultAvgMinutes: number;
  description: string;
  category: string;
}

export type TokenStatus =
  | 'waiting'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'missed';

export type QueueStatusClassification =
  | 'Turn Approaching'
  | 'Moderate Wait'
  | 'Busy Queue'
  | 'Service Unavailable';

export interface TokenNotification {
  id: string;
  message: string;
  type: 'turn_approaching' | 'wait_change' | 'in_service' | 'completed' | 'cancelled' | 'info';
  timestamp: number;
}

export interface Token {
  id: string;
  tokenNumber: string; // e.g. "Q101"
  customerName: string;
  contactInfo?: string;
  serviceType: ServiceType;
  notes?: string;
  joinedAt: number; // Unix timestamp ms
  serviceStartedAt?: number;
  completedAt?: number;
  queuePosition: number; // 1-based index among waiting tokens of same service
  customersAhead: number; // queuePosition - 1
  estimatedWaitMinutes: number;
  actualWaitMinutes?: number;
  status: TokenStatus;
  assignedCounterId?: string;
  assignedCounterName?: string;
  notificationHistory: TokenNotification[];
}

export interface Counter {
  id: string; // 'C1', 'C2', 'C3'
  name: string;
  assignedServices: ServiceType[];
  isAvailable: boolean;
  currentTokenId?: string | null;
  totalServedToday: number;
}

export interface AppNotification {
  id: string;
  tokenId?: string;
  tokenNumber?: string;
  title: string;
  message: string;
  type: 'turn_approaching' | 'wait_change' | 'in_service' | 'completed' | 'counter_status' | 'info' | 'cancelled';
  createdAt: number;
  read: boolean;
}

export type DemoRole = 'customer' | 'staff';

export type NavigationTab =
  | 'home'
  | 'join'
  | 'my-token'
  | 'live-status'
  | 'notifications'
  | 'staff'
  | 'analytics';
