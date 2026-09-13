import { eq } from 'drizzle-orm';
import { db } from '$lib/infrastructure/database/client';
import { users, roles, userRoles } from '$lib/infrastructure/database/schema/index';
import { User } from '$lib/domain/entities/User';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export interface CreateUserData {
	id: string;
	email: string;
	username: string;
	passwordHash: string;
	roleIds: string[];
}

export class DrizzleUserRepository implements IUserRepository {
	private mapToEntity(row: typeof users.$inferSelect, roleNames: RoleNameType[]): User {
		return new User({
			id: row.id,
			email: row.email,
			username: row.username,
			passwordHash: row.passwordHash,
			roles: roleNames,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		});
	}

	private async getRolesForUser(userId: string): Promise<RoleNameType[]> {
		const rows = await db
			.select({ name: roles.name })
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, userId));

		return rows.map((r) => r.name as RoleNameType);
	}

	async findById(id: string): Promise<User | null> {
		const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
		if (!rows.length) return null;

		const roleNames = await this.getRolesForUser(id);
		return this.mapToEntity(rows[0], roleNames);
	}

	async findByEmail(email: string): Promise<User | null> {
		const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (!rows.length) return null;

		const roleNames = await this.getRolesForUser(rows[0].id);
		return this.mapToEntity(rows[0], roleNames);
	}

	async findByUsername(username: string): Promise<User | null> {
		const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
		if (!rows.length) return null;

		const roleNames = await this.getRolesForUser(rows[0].id);
		return this.mapToEntity(rows[0], roleNames);
	}

	async create(data: CreateUserData): Promise<User> {
		const [row] = await db
			.insert(users)
			.values({
				id: data.id,
				email: data.email,
				username: data.username,
				passwordHash: data.passwordHash
			})
			.returning();

		if (data.roleIds.length > 0) {
			await db.insert(userRoles).values(
				data.roleIds.map((roleId) => ({ userId: data.id, roleId }))
			);
		}

		const roleNames = await this.getRolesForUser(data.id);
		return this.mapToEntity(row, roleNames);
	}

	async existsByEmail(email: string): Promise<boolean> {
		const rows = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		return rows.length > 0;
	}

	async existsByUsername(username: string): Promise<boolean> {
		const rows = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.limit(1);

		return rows.length > 0;
	}
}
