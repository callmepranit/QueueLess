/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Token,
  Counter,
  AppNotification,
  ServiceType,
  DemoRole,
  NavigationTab,
} from '../types/queue';
import {
  recalculateQueueTokens,
  calculateEstimatedWait,
  calculatePredictionAccuracy,
  MaeReport,
  getActiveCountersForService,
} from '../utils/predictionEngine';

interface QueueContextType {
  tokens: Token[];
  counters: Counter[];
  notifications: AppNotification[];
  activeTokenId: string | null;
  activeToken: Token | null;
  currentRole: DemoRole;
  currentTab: NavigationTab;
  lastUpdated: Date;
  maeReport: MaeReport;
  setCurrentRole: (role: DemoRole) => void;
  setCurrentTab: (tab: NavigationTab) => void;
  setActiveTokenId: (id: string | null) => void;
  joinQueue: (
    customerName: string,
    serviceType: ServiceType,
    contactInfo?: string,
    notes?: string
  ) => Token;
  cancelToken: (tokenId: string) => void;
  callNextToken: (counterId: string, specificService?: ServiceType) => Token | null;
  completeToken: (tokenId: string, counterId?: string) => void;
  markTokenMissed: (tokenId: string) => void;
  toggleCounterAvailability: (counterId: string) => void;
  refreshQueue: () => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  seedSampleStudents: (count?: number) => void;
  simulateCounterToggle: (counterId: string) => void;
  simulateCompleteCurrent: (counterId: string) => void;
}

const STORAGE_KEYS = {
  TOKENS: 'queueless_tokens_v2',
  COUNTERS: 'queueless_counters_v2',
  NOTIFICATIONS: 'queueless_notifications_v2',
  ACTIVE_TOKEN: 'queueless_active_token_id_v2',
  ROLE: 'queueless_role_v2',
  TOKEN_COUNTER: 'queueless_next_num_v2',
};

const INITIAL_COUNTERS: Counter[] = [
  {
    id: 'C1',
    name: 'Counter 1',
    assignedServices: ['Document Verification', 'Certificate Request', 'General Administration'],
    isAvailable: true,
    currentTokenId: 'token-103',
    totalServedToday: 14,
  },
  {
    id: 'C2',
    name: 'Counter 2',
    assignedServices: ['Fee Enquiry', 'General Administration'],
    isAvailable: true,
    currentTokenId: 'token-102',
    totalServedToday: 18,
  },
  {
    id: 'C3',
    name: 'Counter 3',
    assignedServices: ['Admission Assistance', 'General Administration'],
    isAvailable: true,
    currentTokenId: null,
    totalServedToday: 11,
  },
];

const INITIAL_TOKENS: Token[] = [
  {
    id: 'token-101',
    tokenNumber: 'Q101',
    customerName: 'Aarav Sharma',
    contactInfo: 'aarav.s@college.edu',
    serviceType: 'Document Verification',
    notes: 'Final semester mark-sheet verification for graduation application',
    joinedAt: Date.now() - 38 * 60 * 1000,
    serviceStartedAt: Date.now() - 32 * 60 * 1000,
    completedAt: Date.now() - 27 * 60 * 1000,
    queuePosition: 0,
    customersAhead: 0,
    estimatedWaitMinutes: 5,
    actualWaitMinutes: 6,
    status: 'completed',
    assignedCounterId: 'C1',
    assignedCounterName: 'Counter 1',
    notificationHistory: [],
  },
  {
    id: 'token-102',
    tokenNumber: 'Q102',
    customerName: 'Priya Nair',
    contactInfo: 'priya.nair@example.com',
    serviceType: 'Fee Enquiry',
    notes: 'Hostel fee installment and scholarship receipt query',
    joinedAt: Date.now() - 15 * 60 * 1000,
    serviceStartedAt: Date.now() - 3 * 60 * 1000,
    queuePosition: 0,
    customersAhead: 0,
    estimatedWaitMinutes: 3,
    actualWaitMinutes: 12,
    status: 'in_service',
    assignedCounterId: 'C2',
    assignedCounterName: 'Counter 2',
    notificationHistory: [],
  },
  {
    id: 'token-103',
    tokenNumber: 'Q103',
    customerName: 'Rohan Varma',
    contactInfo: 'rohan.v@college.edu',
    serviceType: 'Document Verification',
    notes: 'Transcript attestation for overseas education',
    joinedAt: Date.now() - 18 * 60 * 1000,
    serviceStartedAt: Date.now() - 4 * 60 * 1000,
    queuePosition: 0,
    customersAhead: 0,
    estimatedWaitMinutes: 5,
    actualWaitMinutes: 14,
    status: 'in_service',
    assignedCounterId: 'C1',
    assignedCounterName: 'Counter 1',
    notificationHistory: [],
  },
  {
    id: 'token-104',
    tokenNumber: 'Q104',
    customerName: 'Ananya Patel',
    contactInfo: 'ananya.p@college.edu',
    serviceType: 'Document Verification',
    notes: 'Provisional degree document check',
    joinedAt: Date.now() - 9 * 60 * 1000,
    queuePosition: 1,
    customersAhead: 0,
    estimatedWaitMinutes: 0,
    status: 'waiting',
    notificationHistory: [],
  },
  {
    id: 'token-105',
    tokenNumber: 'Q105',
    customerName: 'Devansh Mehta',
    contactInfo: 'devansh.m@gmail.com',
    serviceType: 'Document Verification',
    notes: 'Transfer certificate verification',
    joinedAt: Date.now() - 6 * 60 * 1000,
    queuePosition: 2,
    customersAhead: 1,
    estimatedWaitMinutes: 5,
    status: 'waiting',
    notificationHistory: [],
  },
  {
    id: 'token-106',
    tokenNumber: 'Q106',
    customerName: 'Isha Deshmukh',
    contactInfo: 'isha.d@college.edu',
    serviceType: 'Admission Assistance',
    notes: 'Cap round 3 branch transfer enquiry',
    joinedAt: Date.now() - 4 * 60 * 1000,
    queuePosition: 1,
    customersAhead: 0,
    estimatedWaitMinutes: 0,
    status: 'waiting',
    notificationHistory: [],
  },
  {
    id: 'token-107',
    tokenNumber: 'Q107',
    customerName: 'Siddharth Rao',
    contactInfo: 'siddharth.r@college.edu',
    serviceType: 'Certificate Request',
    notes: 'Bonafide certificate for passport renewal',
    joinedAt: Date.now() - 2 * 60 * 1000,
    queuePosition: 1,
    customersAhead: 0,
    estimatedWaitMinutes: 0,
    status: 'waiting',
    notificationHistory: [],
  },
  {
    id: 'token-108',
    tokenNumber: 'Q108',
    customerName: 'Tanvi Kulkarni',
    contactInfo: 'tanvi.k@gmail.com',
    serviceType: 'Admission Assistance',
    notes: 'Merit list counseling documents',
    joinedAt: Date.now() - 1 * 60 * 1000,
    queuePosition: 2,
    customersAhead: 1,
    estimatedWaitMinutes: 6,
    status: 'waiting',
    notificationHistory: [],
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    tokenId: 'token-104',
    tokenNumber: 'Q104',
    title: 'Turn Approaching',
    message: 'Your token Q104 is next in line for Document Verification. Please proceed near Counter 1.',
    type: 'turn_approaching',
    createdAt: Date.now() - 8 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-2',
    tokenId: 'token-103',
    tokenNumber: 'Q103',
    title: 'Now Serving',
    message: 'Token Q103 is now being served at Counter 1.',
    type: 'in_service',
    createdAt: Date.now() - 4 * 60 * 1000,
    read: true,
  },
  {
    id: 'notif-3',
    tokenId: 'token-101',
    tokenNumber: 'Q101',
    title: 'Service Completed',
    message: 'Your service at Counter 1 has concluded. Thank you for using QueueLess.',
    type: 'completed',
    createdAt: Date.now() - 27 * 60 * 1000,
    read: true,
  },
];

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe localStorage loader
  const [tokens, setTokens] = useState<Token[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored tokens, falling back to initial seed', e);
    }
    return INITIAL_TOKENS;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COUNTERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored counters, falling back to initial seed', e);
    }
    return INITIAL_COUNTERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTokenId, setActiveTokenIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN) || 'token-104';
    } catch {
      return 'token-104';
    }
  });

  const [currentRole, setCurrentRoleState] = useState<DemoRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (stored === 'staff' || stored === 'customer') {
        return stored;
      }
    } catch {}
    return 'customer';
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nextTokenNum, setNextTokenNum] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TOKEN_COUNTER);
      return stored ? parseInt(stored, 10) : 109;
    } catch {
      return 109;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    } catch (err) {
      console.error('Failed to sync tokens to localStorage', err);
    }
  }, [tokens]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
    } catch (err) {
      console.error('Failed to sync counters to localStorage', err);
    }
  }, [counters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to sync notifications to localStorage', err);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      if (activeTokenId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TOKEN, activeTokenId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN);
      }
    } catch (err) {
      console.error('Failed to sync activeToken to localStorage', err);
    }
  }, [activeTokenId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    } catch (err) {
      console.error('Failed to sync role to localStorage', err);
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN_COUNTER, nextTokenNum.toString());
    } catch (err) {
      console.error('Failed to sync nextTokenNum to localStorage', err);
    }
  }, [nextTokenNum]);

  const setActiveTokenId = (id: string | null) => {
    setActiveTokenIdState(id);
  };

  const setCurrentRole = (role: DemoRole) => {
    setCurrentRoleState(role);
  };

  // Helper to add in-app notification without duplicates
  const addNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      setNotifications((prev) => {
        // Prevent duplicate turn_approaching notification for the same token
        if (notif.type === 'turn_approaching' && notif.tokenId) {
          const alreadyExists = prev.some(
            (n) => n.tokenId === notif.tokenId && n.type === 'turn_approaching'
          );
          if (alreadyExists) return prev;
        }

        const newEntry: AppNotification = {
          ...notif,
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: Date.now(),
          read: false,
        };
        return [newEntry, ...prev];
      });
    },
    []
  );

  // Recalculate queue helper
  const recomputeQueue = useCallback(
    (currentTokens: Token[], currentCounters: Counter[]) => {
      const updated = recalculateQueueTokens(currentTokens, currentCounters);

      // Check for turn approaching triggers for waiting tokens (<= 5 min wait)
      updated.forEach((t) => {
        if (t.status === 'waiting') {
          const activeCount = getActiveCountersForService(t.serviceType, currentCounters);
          if (activeCount > 0 && t.estimatedWaitMinutes <= 5) {
            // Check if we already notified
            const hasNotif = notifications.some(
              (n) => n.tokenId === t.id && n.type === 'turn_approaching'
            );
            if (!hasNotif) {
              addNotification({
                tokenId: t.id,
                tokenNumber: t.tokenNumber,
                title: 'Turn Approaching',
                message: `Your token ${t.tokenNumber} has an estimated wait of ${t.estimatedWaitMinutes} minute${
                  t.estimatedWaitMinutes === 1 ? '' : 's'
                }. Please proceed to the service area.`,
                type: 'turn_approaching',
              });
            }
          }
        }
      });

      setTokens(updated);
      setLastUpdated(new Date());
    },
    [addNotification, notifications]
  );

  // Manual refresh
  const refreshQueue = useCallback(() => {
    recomputeQueue(tokens, counters);
  }, [recomputeQueue, tokens, counters]);

  // Join Queue action
  const joinQueue = useCallback(
    (
      customerName: string,
      serviceType: ServiceType,
      contactInfo?: string,
      notes?: string
    ): Token => {
      const tokenNumber = `Q${nextTokenNum}`;
      setNextTokenNum((prev) => prev + 1);

      const newTokenId = `token-${Date.now()}`;
      const joinedAt = Date.now();

      // Count how many are waiting for this service right now
      const waitingAhead = tokens.filter(
        (t) => t.status === 'waiting' && t.serviceType === serviceType
      ).length;

      const prediction = calculateEstimatedWait(waitingAhead, serviceType, counters);

      const newToken: Token = {
        id: newTokenId,
        tokenNumber,
        customerName: customerName.trim(),
        contactInfo: contactInfo?.trim() || undefined,
        serviceType,
        notes: notes?.trim() || undefined,
        joinedAt,
        queuePosition: waitingAhead + 1,
        customersAhead: waitingAhead,
        estimatedWaitMinutes: prediction.estimatedWaitMinutes,
        status: 'waiting',
        notificationHistory: [],
      };

      const nextTokens = [...tokens, newToken];
      const recalculated = recalculateQueueTokens(nextTokens, counters);
      setTokens(recalculated);

      // Set as active customer token so customer doesn't lose it
      setActiveTokenIdState(newTokenId);
      setLastUpdated(new Date());

      // Welcome notification
      addNotification({
        tokenId: newTokenId,
        tokenNumber,
        title: 'Token Generated',
        message: `Your token ${tokenNumber} has been generated for ${serviceType}. Current wait estimate: ${prediction.estimatedWaitMinutes} minutes.`,
        type: 'info',
      });

      if (prediction.estimatedWaitMinutes <= 5 && !prediction.isServiceUnavailable) {
        addNotification({
          tokenId: newTokenId,
          tokenNumber,
          title: 'Turn Approaching',
          message: `Your token ${tokenNumber} is ready soon (estimated wait: ${prediction.estimatedWaitMinutes} min). Please remain nearby.`,
          type: 'turn_approaching',
        });
      }

      return newToken;
    },
    [counters, nextTokenNum, tokens, addNotification]
  );

  // Cancel token action
  const cancelToken = useCallback(
    (tokenId: string) => {
      const target = tokens.find((t) => t.id === tokenId);
      if (!target) return;

      const updatedTokens = tokens.map((t) =>
        t.id === tokenId ? { ...t, status: 'cancelled' as const } : t
      );

      // Free any counter serving this token
      const updatedCounters = counters.map((c) =>
        c.currentTokenId === tokenId ? { ...c, currentTokenId: null } : c
      );

      setCounters(updatedCounters);
      const recalculated = recalculateQueueTokens(updatedTokens, updatedCounters);
      setTokens(recalculated);
      setLastUpdated(new Date());

      addNotification({
        tokenId,
        tokenNumber: target.tokenNumber,
        title: 'Token Cancelled',
        message: `Token ${target.tokenNumber} for ${target.customerName} has been cancelled.`,
        type: 'cancelled',
      });
    },
    [tokens, counters, addNotification]
  );

  // Call next waiting customer for a counter
  const callNextToken = useCallback(
    (counterId: string, specificService?: ServiceType): Token | null => {
      const counter = counters.find((c) => c.id === counterId);
      if (!counter || !counter.isAvailable) return null;

      // Find eligible waiting tokens for services assigned to this counter
      const eligibleTokens = tokens
        .filter((t) => {
          if (t.status !== 'waiting') return false;
          if (specificService) return t.serviceType === specificService;
          return counter.assignedServices.includes(t.serviceType);
        })
        .sort((a, b) => a.joinedAt - b.joinedAt);

      if (eligibleTokens.length === 0) return null;

      const nextToken = eligibleTokens[0];
      const now = Date.now();
      const actualWaitMin = Math.max(1, Math.round((now - nextToken.joinedAt) / 60000));

      const updatedTokens = tokens.map((t) => {
        if (t.id === nextToken.id) {
          return {
            ...t,
            status: 'in_service' as const,
            serviceStartedAt: now,
            actualWaitMinutes: actualWaitMin,
            assignedCounterId: counter.id,
            assignedCounterName: counter.name,
            queuePosition: 0,
            customersAhead: 0,
          };
        }
        return t;
      });

      const updatedCounters = counters.map((c) =>
        c.id === counterId ? { ...c, currentTokenId: nextToken.id } : c
      );

      setCounters(updatedCounters);
      const recalculated = recalculateQueueTokens(updatedTokens, updatedCounters);
      setTokens(recalculated);
      setLastUpdated(new Date());

      addNotification({
        tokenId: nextToken.id,
        tokenNumber: nextToken.tokenNumber,
        title: 'Now In Service',
        message: `Token ${nextToken.tokenNumber} (${nextToken.customerName}) is now being served at ${counter.name}.`,
        type: 'in_service',
      });

      return nextToken;
    },
    [counters, tokens, addNotification]
  );

  // Complete token action
  const completeToken = useCallback(
    (tokenId: string, counterId?: string) => {
      const target = tokens.find((t) => t.id === tokenId);
      if (!target) return;

      const now = Date.now();
      const effectiveStarted = target.serviceStartedAt || now - 5 * 60000;
      const actualWaitMin =
        target.actualWaitMinutes || Math.max(1, Math.round((effectiveStarted - target.joinedAt) / 60000));

      const updatedTokens = tokens.map((t) => {
        if (t.id === tokenId) {
          return {
            ...t,
            status: 'completed' as const,
            completedAt: now,
            actualWaitMinutes: actualWaitMin,
            queuePosition: 0,
            customersAhead: 0,
          };
        }
        return t;
      });

      // Free counter
      const updatedCounters = counters.map((c) => {
        if (c.currentTokenId === tokenId || (counterId && c.id === counterId)) {
          return {
            ...c,
            currentTokenId: null,
            totalServedToday: c.totalServedToday + 1,
          };
        }
        return c;
      });

      setCounters(updatedCounters);
      const recalculated = recalculateQueueTokens(updatedTokens, updatedCounters);
      setTokens(recalculated);
      setLastUpdated(new Date());

      addNotification({
        tokenId,
        tokenNumber: target.tokenNumber,
        title: 'Service Completed',
        message: `Token ${target.tokenNumber} for ${target.customerName} has been completed successfully.`,
        type: 'completed',
      });
    },
    [tokens, counters, addNotification]
  );

  // Mark token missed
  const markTokenMissed = useCallback(
    (tokenId: string) => {
      const target = tokens.find((t) => t.id === tokenId);
      if (!target) return;

      const updatedTokens = tokens.map((t) =>
        t.id === tokenId ? { ...t, status: 'missed' as const, queuePosition: 0, customersAhead: 0 } : t
      );

      const updatedCounters = counters.map((c) =>
        c.currentTokenId === tokenId ? { ...c, currentTokenId: null } : c
      );

      setCounters(updatedCounters);
      const recalculated = recalculateQueueTokens(updatedTokens, updatedCounters);
      setTokens(recalculated);
      setLastUpdated(new Date());

      addNotification({
        tokenId,
        tokenNumber: target.tokenNumber,
        title: 'Token Marked Missed',
        message: `Token ${target.tokenNumber} did not report to the counter and was marked missed.`,
        type: 'counter_status',
      });
    },
    [tokens, counters, addNotification]
  );

  // Toggle counter availability
  const toggleCounterAvailability = useCallback(
    (counterId: string) => {
      const targetCounter = counters.find((c) => c.id === counterId);
      if (!targetCounter) return;

      const newAvailability = !targetCounter.isAvailable;

      const updatedCounters = counters.map((c) => {
        if (c.id === counterId) {
          return {
            ...c,
            isAvailable: newAvailability,
            // If turning unavailable, vacate active serving token back to waiting
            currentTokenId: newAvailability ? c.currentTokenId : null,
          };
        }
        return c;
      });

      let updatedTokens = [...tokens];
      // If turning unavailable and was serving a token, move that token back to waiting
      if (!newAvailability && targetCounter.currentTokenId) {
        updatedTokens = updatedTokens.map((t) =>
          t.id === targetCounter.currentTokenId
            ? { ...t, status: 'waiting' as const, assignedCounterId: undefined, assignedCounterName: undefined }
            : t
        );
      }

      setCounters(updatedCounters);
      const recalculated = recalculateQueueTokens(updatedTokens, updatedCounters);
      setTokens(recalculated);
      setLastUpdated(new Date());

      addNotification({
        title: newAvailability ? `${targetCounter.name} Activated` : `${targetCounter.name} Unavailable`,
        message: newAvailability
          ? `${targetCounter.name} is now online. Queue waiting times have been reduced.`
          : `${targetCounter.name} is temporarily offline. Waiting times have been adjusted automatically.`,
        type: 'counter_status',
      });
    },
    [counters, tokens, addNotification]
  );

  // Mark single notification read
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all notifications read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    setTokens(INITIAL_TOKENS);
    setCounters(INITIAL_COUNTERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTokenIdState('token-104');
    setNextTokenNum(109);
    setCurrentRoleState('customer');
    setLastUpdated(new Date());
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.COUNTERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_COUNTER);
  }, []);

  // Seed sample students for demo
  const seedSampleStudents = useCallback(
    (count = 5) => {
      const sampleNames = [
        'Kavya Joshi',
        'Arjun Singhania',
        'Neha Chawla',
        'Aditya Sen',
        'Meera Iyer',
        'Harshvardhan Patil',
        'Ritika Jain',
        'Gaurav Dixit',
      ];
      const services: ServiceType[] = [
        'Document Verification',
        'Certificate Request',
        'Fee Enquiry',
        'Admission Assistance',
        'General Administration',
      ];

      let currentNum = nextTokenNum;
      const newTokensToAdd: Token[] = [];

      for (let i = 0; i < count; i++) {
        const name = sampleNames[(tokens.length + i) % sampleNames.length];
        const sType = services[(tokens.length + i) % services.length];
        const tokNum = `Q${currentNum}`;
        currentNum++;

        newTokensToAdd.push({
          id: `token-${Date.now()}-${i}`,
          tokenNumber: tokNum,
          customerName: name,
          contactInfo: `${name.toLowerCase().replace(' ', '.')}@demo.edu`,
          serviceType: sType,
          notes: `Sample student joined during live presentation test #${i + 1}`,
          joinedAt: Date.now() - (count - i) * 60 * 1000,
          queuePosition: 1,
          customersAhead: 0,
          estimatedWaitMinutes: 5,
          status: 'waiting',
          notificationHistory: [],
        });
      }

      setNextTokenNum(currentNum);
      const combined = [...tokens, ...newTokensToAdd];
      const recalculated = recalculateQueueTokens(combined, counters);
      setTokens(recalculated);
      setLastUpdated(new Date());

      addNotification({
        title: 'Demo Batch Added',
        message: `Added ${count} sample students into the queue. Waiting estimates updated across all services.`,
        type: 'info',
      });
    },
    [nextTokenNum, tokens, counters, addNotification]
  );

  // Fast demo simulation helpers
  const simulateCounterToggle = useCallback(
    (counterId: string) => {
      toggleCounterAvailability(counterId);
    },
    [toggleCounterAvailability]
  );

  const simulateCompleteCurrent = useCallback(
    (counterId: string) => {
      const counter = counters.find((c) => c.id === counterId);
      if (counter && counter.currentTokenId) {
        completeToken(counter.currentTokenId, counterId);
      } else if (counter && counter.isAvailable) {
        callNextToken(counterId);
      }
    },
    [counters, completeToken, callNextToken]
  );

  // Active token object
  const activeToken = useMemo(() => {
    if (!activeTokenId) return null;
    return tokens.find((t) => t.id === activeTokenId) || null;
  }, [activeTokenId, tokens]);

  // MAE accuracy report
  const maeReport = useMemo(() => {
    return calculatePredictionAccuracy(tokens);
  }, [tokens]);

  return (
    <QueueContext.Provider
      value={{
        tokens,
        counters,
        notifications,
        activeTokenId,
        activeToken,
        currentRole,
        currentTab,
        lastUpdated,
        maeReport,
        setCurrentRole,
        setCurrentTab,
        setActiveTokenId,
        joinQueue,
        cancelToken,
        callNextToken,
        completeToken,
        markTokenMissed,
        toggleCounterAvailability,
        refreshQueue,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        seedSampleStudents,
        simulateCounterToggle,
        simulateCompleteCurrent,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = (): QueueContextType => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
