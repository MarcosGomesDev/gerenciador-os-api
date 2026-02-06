export const roles = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  DEPARTMENT: 'DEPARTMENT',
} as const;

export type Role = (typeof roles)[keyof typeof roles];
