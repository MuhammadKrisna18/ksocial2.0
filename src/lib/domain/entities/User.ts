import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export interface UserProps {
	id: string;
	email: string;
	passwordHash: string;
	username: string;
	roles: RoleNameType[];
	createdAt: Date;
	updatedAt: Date;
}

export class User {
	readonly id: string;
	readonly email: string;
	readonly passwordHash: string;
	readonly username: string;
	readonly roles: RoleNameType[];
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(props: UserProps) {
		this.id = props.id;
		this.email = props.email;
		this.passwordHash = props.passwordHash;
		this.username = props.username;
		this.roles = props.roles;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	hasRole(role: RoleNameType): boolean {
		return this.roles.includes(role);
	}

	isAdmin(): boolean {
		return this.hasRole('admin');
	}
}
