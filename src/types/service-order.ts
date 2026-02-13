export const serviceOrderTypes = {
  TI: 'TI',
  MAINTENANCE: 'MAINTENANCE',
  SYSTEM: 'SYSTEM',
  NETWORK: 'NETWORK',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  OTHER: 'OTHER',
} as const;

export type ServiceOrderType =
  (typeof serviceOrderTypes)[keyof typeof serviceOrderTypes];

export const serviceOrderPriorities = {
  URGENT: 'URGENT',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type ServiceOrderPriority =
  (typeof serviceOrderPriorities)[keyof typeof serviceOrderPriorities];

export const serviceOrderStatuses = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
} as const;

export type ServiceOrderStatus =
  (typeof serviceOrderStatuses)[keyof typeof serviceOrderStatuses];
