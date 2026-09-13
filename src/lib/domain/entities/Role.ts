import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export interface RoleProps {
	id: string;
	name: RoleNameType;
	createdAt: Date;
}

export class Role {
	readonly id: string;
	readonly name: RoleNameType;
	readonly createdAt: Date;

	constructor(props: RoleProps) {
		this.id = props.id;
		this.name = props.name;
		this.createdAt = props.createdAt;
	}

	isAdmin(): boolean {
		return this.name === 'admin';
	}
}
