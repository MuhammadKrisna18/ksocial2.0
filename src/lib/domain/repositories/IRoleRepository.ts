import type { Role } from '$lib/domain/entities/Role';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export interface IRoleRepository {
	findById(id: string): Promise<Role | null>;
	findByName(name: RoleNameType): Promise<Role | null>;
	findAll(): Promise<Role[]>;
	create(data: { id: string; name: RoleNameType }): Promise<Role>;
	existsByName(name: RoleNameType): Promise<boolean>;
}
