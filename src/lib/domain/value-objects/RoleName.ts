export const ROLE_NAMES = ['admin', 'user'] as const;

export type RoleNameType = (typeof ROLE_NAMES)[number];

