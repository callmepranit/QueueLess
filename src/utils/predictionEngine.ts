/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceType, ServiceConfig, Counter, Token, QueueStatusClassification } from '../types/queue';

export const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  'Document Verification': {
    id: 'Document Verification',
    name: 'Document Verification',
    defaultAvgMinutes: 5,
    description: 'Degree certificates, marksheets, identity verification & migration clearance.',
    category: 'Academic Records',
  },
  'Certificate Request': {
    id: 'Certificate Request',
    name: 'Certificate Request',
    defaultAvgMinutes: 4,
    description: 'Bonafide letters, transcripts, rank certificates & character letters.',
    category: 'Student Records',
  },
  'Fee Enquiry': {
    id: 'Fee Enquiry',
    name: 'Fee Enquiry',
    defaultAvgMinutes: 3,
    description: 'Tuition payment receipts, scholarship adjustment & dues clearance.',
    category: 'Finance',
  },
  'Admission Assistance': {
    id: 'Admission Assistance',
    name: 'Admission Assistance',
    defaultAvgMinutes: 6,
    description: 'Seat allocation, course enrollment, counselling & transfer guidance.',
    category: 'Admissions',
  },
  'General Administration': {
    id: 'General Administration',
    name: 'General Administration',
    defaultAvgMinutes: 5,
    description: 'ID cards, locker allocations, hostel forms & general student queries.',
    category: 'Campus Administration',
  },
};

export const INITIAL_SERVICES: ServiceType[] = [
  'Document Verification',
  'Certificate Request',
  'Fee Enquiry',
  'Admission Assistance',
  'General Administration',
];

/**
 * Calculates the number of active counters that serve a specific service.
 */
export function getActiveCountersForService(serviceType: ServiceType, counters: Counter[]): number {
  return counters.filter(
    (counter) => counter.isAvailable && counter.assignedServices.includes(serviceType)
  ).length;
}

export interface PredictionResult {
  estimatedWaitMinutes: number;
  customersAhead: number;
  averageServiceMinutes: number;
  activeCounters: number;
  isServiceUnavailable: boolean;
  classification: QueueStatusClassification;
  formulaExplanation: string;
}

/**
 * Core AI / Baseline Queue Prediction Engine:
 * Formula: Estimated Wait = ceil((Customers Ahead × Average Service Minutes) / Active Counters)
 *
 * Rules:
 * - Customers Ahead >= 0
 * - If Customers Ahead == 0 => Estimated Wait = 0 minutes
 * - Active Counters >= 1 (if 0, returns isServiceUnavailable: true without division by zero)
 * - Average Service Minutes > 0
 */
export function calculateEstimatedWait(
  customersAhead: number,
  serviceType: ServiceType,
  counters: Counter[],
  customAvgMinutes?: number
): PredictionResult {
  const avgMinutes = customAvgMinutes || SERVICE_CONFIGS[serviceType]?.defaultAvgMinutes || 5;
  const activeCounters = getActiveCountersForService(serviceType, counters);

  const safeCustomersAhead = Math.max(0, customersAhead);

  if (activeCounters <= 0) {
    return {
      estimatedWaitMinutes: 0,
      customersAhead: safeCustomersAhead,
      averageServiceMinutes: avgMinutes,
      activeCounters: 0,
      isServiceUnavailable: true,
      classification: 'Service Unavailable',
      formulaExplanation: 'Service temporarily unavailable: No active counters are currently operating for this service.',
    };
  }

  if (safeCustomersAhead === 0) {
    return {
      estimatedWaitMinutes: 0,
      customersAhead: 0,
      averageServiceMinutes: avgMinutes,
      activeCounters,
      isServiceUnavailable: false,
      classification: 'Turn Approaching',
      formulaExplanation: '0 customers ahead. Next in line for an available counter (0 min).',
    };
  }

  // Formula: ceil((Customers Ahead × Average Service Minutes) / Active Counters)
  const rawWait = (safeCustomersAhead * avgMinutes) / activeCounters;
  const estimatedWaitMinutes = Math.ceil(rawWait);

  const classification = getQueueStatusClassification(estimatedWaitMinutes, false);

  const formulaExplanation = `ceil((${safeCustomersAhead} customers ahead × ${avgMinutes} min avg) / ${activeCounters} active counters) = ${estimatedWaitMinutes} min`;

  return {
    estimatedWaitMinutes,
    customersAhead: safeCustomersAhead,
    averageServiceMinutes: avgMinutes,
    activeCounters,
    isServiceUnavailable: false,
    classification,
    formulaExplanation,
  };
}

/**
 * Queue status labels based on the exact project rules:
 * - <= 5 minutes: Turn Approaching
 * - > 5 and <= 15 minutes: Moderate Wait
 * - > 15 minutes: Busy Queue
 */
export function getQueueStatusClassification(
  waitMinutes: number,
  isUnavailable: boolean
): QueueStatusClassification {
  if (isUnavailable) {
    return 'Service Unavailable';
  }
  if (waitMinutes <= 5) {
    return 'Turn Approaching';
  }
  if (waitMinutes <= 15) {
    return 'Moderate Wait';
  }
  return 'Busy Queue';
}

/**
 * Re-computes queue positions (1-based index) and estimated waiting times
 * for all waiting tokens, independently grouped by serviceType.
 */
export function recalculateQueueTokens(tokens: Token[], counters: Counter[]): Token[] {
  // Group waiting tokens by serviceType, sorted by joinedAt ascending
  const waitingTokensByService: Record<string, Token[]> = {};

  tokens.forEach((t) => {
    if (t.status === 'waiting') {
      if (!waitingTokensByService[t.serviceType]) {
        waitingTokensByService[t.serviceType] = [];
      }
      waitingTokensByService[t.serviceType].push(t);
    }
  });

  // Sort each service's queue by joinedAt
  Object.keys(waitingTokensByService).forEach((service) => {
    waitingTokensByService[service].sort((a, b) => a.joinedAt - b.joinedAt);
  });

  return tokens.map((token) => {
    if (token.status !== 'waiting') {
      return token;
    }

    const serviceQueue = waitingTokensByService[token.serviceType] || [];
    const indexInQueue = serviceQueue.findIndex((t) => t.id === token.id);

    if (indexInQueue === -1) {
      return token;
    }

    const queuePosition = indexInQueue + 1; // 1-based position
    const customersAhead = indexInQueue; // index equals customers ahead

    const prediction = calculateEstimatedWait(customersAhead, token.serviceType, counters);

    return {
      ...token,
      queuePosition,
      customersAhead,
      estimatedWaitMinutes: prediction.estimatedWaitMinutes,
    };
  });
}

export interface PredictionMetricEvaluation {
  predictedWaitMinutes: number;
  actualWaitMinutes: number;
  absoluteError: number;
}

export interface MaeReport {
  evaluatedTokensCount: number;
  meanAbsoluteError: number | null;
  evaluations: (Token & { absoluteError: number })[];
  summaryMessage: string;
}

/**
 * Calculate MAE (Mean Absolute Error) for completed tokens where actualWaitMinutes is recorded.
 * Formula: MAE = Sum of Absolute Errors / Number of Evaluated Tokens
 * Absolute Error = abs(Predicted Wait - Actual Wait)
 */
export function calculatePredictionAccuracy(tokens: Token[]): MaeReport {
  const completedWithActual = tokens.filter(
    (t) =>
      t.status === 'completed' &&
      typeof t.actualWaitMinutes === 'number' &&
      typeof t.estimatedWaitMinutes === 'number'
  );

  if (completedWithActual.length === 0) {
    return {
      evaluatedTokensCount: 0,
      meanAbsoluteError: null,
      evaluations: [],
      summaryMessage: 'Insufficient data for evaluation.',
    };
  }

  let totalAbsoluteError = 0;
  const evaluations = completedWithActual.map((token) => {
    const error = Math.abs(token.estimatedWaitMinutes - (token.actualWaitMinutes || 0));
    totalAbsoluteError += error;
    return {
      ...token,
      absoluteError: error,
    };
  });

  const mae = Number((totalAbsoluteError / completedWithActual.length).toFixed(1));

  return {
    evaluatedTokensCount: completedWithActual.length,
    meanAbsoluteError: mae,
    evaluations,
    summaryMessage: `Mean Absolute Error: ${mae} min across ${completedWithActual.length} evaluated completed tokens.`,
  };
}
