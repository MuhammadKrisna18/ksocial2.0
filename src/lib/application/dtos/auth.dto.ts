import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export interface RegisterDTO {
	email: string;
	username: string;
	password: string;
}

export interface LoginDTO {
	email: string;
	password: string;
}

export interface AuthResponseDTO {
	accessToken: string;
	user: {
		id: string;
		email: string;
		username: string;
		roles: RoleNameType[];
	};
}
