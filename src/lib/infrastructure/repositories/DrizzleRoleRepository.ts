import { eq } from 'drizzle-orm';
import { db } from '$lib/infrastructure/database/client';
import { roles } from '$lib/infrastructure/database/schema/index';
import { Role } from '$lib/domain/entities/Role';
import type { IRoleRepository } from '$lib/domain/repositories/IRoleRepository';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export class DrizzleRoleRepository implements IRoleRepository {
	private mapToEntity(row: typeof roles.$inferSelect): Role {
		return new Role({
			id: row.id,
			name: row.name as RoleNameType,
			createdAt: row.createdAt
		});
	}

	async findById(id: string): Promise<Role | null> {
		const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
		if (!rows.length) return null;
		return this.mapToEntity(rows[0]);
	}

	async findByName(name: RoleNameType): Promise<Role | null> {
		const rows = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
		if (!rows.length) return null;
		return this.mapToEntity(rows[0]);
	}

	async findAll(): Promise<Role[]> {
		const rows = await db.select().from(roles);
		return rows.map((r) => this.mapToEntity(r));
	}

	async create(data: { id: string; name: RoleNameType }): Promise<Role> {
		const [row] = await db
			.insert(roles)
			.values({ id: data.id, name: data.name })
			.returning();
		return this.mapToEntity(row);
	}

	async existsByName(name: RoleNameType): Promise<boolean> {
		const rows = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1);
		return rows.length > 0;
	}
}
