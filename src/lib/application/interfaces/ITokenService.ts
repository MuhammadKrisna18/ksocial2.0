import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export interface JwtPayload {
	sub: string;
	email: string;
	username: string;
	roles: RoleNameType[];
	iat?: number;
	exp?: number;
}

export interface ITokenService {
	sign(payload: JwtPayload): string;
	verify(token: string): JwtPayload;
	decode(token: string): JwtPayload | null;
}
