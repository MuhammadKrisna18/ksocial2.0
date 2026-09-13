import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export function hasRole(userRoles: RoleNameType[], required: RoleNameType): boolean {
	return userRoles.includes(required);
}

export function hasAnyRole(userRoles: RoleNameType[], required: RoleNameType[]): boolean {
	return required.some((r) => userRoles.includes(r));
}

export function hasAllRoles(userRoles: RoleNameType[], required: RoleNameType[]): boolean {
	return required.every((r) => userRoles.includes(r));
}

export function isAdmin(userRoles: RoleNameType[]): boolean {
	return userRoles.includes('admin');
}
