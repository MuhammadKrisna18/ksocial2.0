export const ROLE_NAMES = ['admin', 'user'] as const;

export type RoleNameType = (typeof ROLE_NAMES)[number];

export const DEFAULT_USER_ROLE: RoleNameType = 'user';
export const ADMIN_ROLE: RoleNameType = 'admin';

