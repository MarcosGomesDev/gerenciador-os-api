export const historicActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  CLOSED: 'CLOSED',
  ATTRIBUTED: 'ATTRIBUTED',
} as const;

export type HistoricAction =
  (typeof historicActions)[keyof typeof historicActions];
