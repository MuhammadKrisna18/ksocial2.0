import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export const BCRYPT_SALT_ROUNDS = 12;

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const DEFAULT_USER_ROLE: RoleNameType = 'user';

export const ADMIN_ROLE: RoleNameType = 'admin';
