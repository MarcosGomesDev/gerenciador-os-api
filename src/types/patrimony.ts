export const patrimonySituations = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type PatrimonySituation =
  (typeof patrimonySituations)[keyof typeof patrimonySituations];
