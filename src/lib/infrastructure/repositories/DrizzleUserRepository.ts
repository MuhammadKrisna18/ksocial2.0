import { eq, inArray } from 'drizzle-orm';
import { db } from '$lib/infrastructure/database/client';
import { users, roles, userRoles } from '$lib/infrastructure/database/schema/index';
import { User } from '$lib/domain/entities/User';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';
import { Email } from '$lib/domain/value-objects/Email';
import { Username } from '$lib/domain/value-objects/Username';

export interface CreateUserData {
	id: string;
	fullName: string;
	email: string;
	username: string;
	passwordHash: string;
	dateOfBirth: Date;
	roleIds: string[];
	isPrivate?: boolean;
	profilePictureUrl?: string | null;
	coverPhotoUrl?: string | null;
	location?: string | null;
	relationshipStatus?: string | null;
	requireFollowForMessage?: boolean;
}

export class DrizzleUserRepository implements IUserRepository {
	private mapToEntity(row: typeof users.$inferSelect, roleNames: RoleNameType[]): User {
		return new User({
			id: row.id,
			fullName: row.fullName,
			email: Email.create(row.email),
			username: Username.create(row.username),
			passwordHash: row.passwordHash,
			roles: roleNames,
			dateOfBirth: row.dateOfBirth,
			isPrivate: row.isPrivate,
			requireFollowForMessage: row.requireFollowForMessage,
			profilePictureUrl: row.profilePictureUrl,
			coverPhotoUrl: row.coverPhotoUrl,
			location: row.location,
			relationshipStatus: row.relationshipStatus,
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
				fullName: data.fullName,
				email: data.email,
				username: data.username,
				passwordHash: data.passwordHash,
				dateOfBirth: data.dateOfBirth,
				isPrivate: data.isPrivate ?? false,
				requireFollowForMessage: data.requireFollowForMessage ?? false,
				profilePictureUrl: data.profilePictureUrl,
				coverPhotoUrl: data.coverPhotoUrl,
				location: data.location,
				relationshipStatus: data.relationshipStatus
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

	async update(id: string, data: Partial<Omit<CreateUserData, 'id' | 'roleIds'>>): Promise<User> {
		const [row] = await db
			.update(users)
			.set({
				...(data.fullName && { fullName: data.fullName }),
				...(data.email && { email: data.email }),
				...(data.username && { username: data.username }),
				...(data.passwordHash && { passwordHash: data.passwordHash }),
				...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
				...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
				...(data.requireFollowForMessage !== undefined && { requireFollowForMessage: data.requireFollowForMessage }),
				...(data.profilePictureUrl !== undefined && { profilePictureUrl: data.profilePictureUrl }),
				...(data.coverPhotoUrl !== undefined && { coverPhotoUrl: data.coverPhotoUrl }),
				...(data.location !== undefined && { location: data.location }),
				...(data.relationshipStatus !== undefined && { relationshipStatus: data.relationshipStatus }),
				updatedAt: new Date()
			})
			.where(eq(users.id, id))
			.returning();

		if (!row) {
			throw new Error('User not found');
		}

		const roleNames = await this.getRolesForUser(id);
		return this.mapToEntity(row, roleNames);
	}

	async delete(id: string): Promise<void> {
		// Because of cascading deletes (if configured) or standard operations, 
		// we first delete the roles to avoid foreign key constraints, 
		// though in Drizzle if we defined 'cascade', it would be handled. 
		// For safety, we can delete userRoles first or let cascade handle it.
		// Since we didn't specify cascade in schema (we don't know for sure), 
		// let's do a transaction to be safe.
		await db.transaction(async (tx) => {
			await tx.delete(userRoles).where(eq(userRoles.userId, id));
			await tx.delete(users).where(eq(users.id, id));
		});
	}

	async count(): Promise<number> {
		const result = await db.select({ count: users.id }).from(users);
		return result.length;
	}

	async findAll(): Promise<User[]> {
		const rows = await db.select().from(users);
		
		if (!rows.length) return [];

		const userIds = rows.map((r) => r.id);

		const allRoles = await db
			.select({
				userId: userRoles.userId,
				name: roles.name
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(inArray(userRoles.userId, userIds));

		const rolesByUserId = allRoles.reduce((acc, curr) => {
			if (!acc[curr.userId]) {
				acc[curr.userId] = [];
			}
			acc[curr.userId].push(curr.name as RoleNameType);
			return acc;
		}, {} as Record<string, RoleNameType[]>);

		return rows.map((row) => {
			const roleNames = rolesByUserId[row.id] || [];
			return this.mapToEntity(row, roleNames);
		});
	}
}
