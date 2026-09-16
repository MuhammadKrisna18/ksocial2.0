import { eq, and } from 'drizzle-orm';
import { db } from '../database/client';
import { follows } from '../database/schema/follows';
import { Follow } from '$lib/domain/entities/Follow';
import type { IFollowRepository, CreateFollowData } from '$lib/domain/repositories/IFollowRepository';

export class DrizzleFollowRepository implements IFollowRepository {
	private mapToEntity(row: typeof follows.$inferSelect): Follow {
		return new Follow({
			followerId: row.followerId,
			followingId: row.followingId,
			status: row.status as 'pending' | 'accepted',
			createdAt: row.createdAt
		});
	}

	async create(data: CreateFollowData): Promise<Follow> {
		const [row] = await db
			.insert(follows)
			.values({
				followerId: data.followerId,
				followingId: data.followingId,
				status: data.status
			})
			.returning();

		return this.mapToEntity(row);
	}

	async updateStatus(followerId: string, followingId: string, status: 'pending' | 'accepted'): Promise<void> {
		await db
			.update(follows)
			.set({ status })
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followingId, followingId)
				)
			);
	}

	async delete(followerId: string, followingId: string): Promise<void> {
		await db
			.delete(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followingId, followingId)
				)
			);
	}

	async findByUsers(followerId: string, followingId: string): Promise<Follow | null> {
		const result = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
		if (result.length === 0) return null;
		return this.mapToEntity(result[0]);
	}

	async getFollowStatus(followerId: string, followingId: string): Promise<string | null> {
		const result = await db
			.select({ status: follows.status })
			.from(follows)
			.where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
			.limit(1);
			
		return result.length > 0 ? result[0].status : null;
	}

	async getFollowers(userId: string): Promise<Follow[]> {
		const rows = await db
			.select()
			.from(follows)
			.where(eq(follows.followingId, userId));
		
		return rows.map(r => this.mapToEntity(r));
	}

	async getFollowing(userId: string): Promise<Follow[]> {
		const rows = await db
			.select()
			.from(follows)
			.where(eq(follows.followerId, userId));
			
		return rows.map(r => this.mapToEntity(r));
	}

	async getFollowersDetails(userId: string): Promise<{id: string; username: string; fullName: string; profilePictureUrl: string | null; status: 'pending' | 'accepted'}[]> {
		// Import users here if not imported at the top, but we need to import it at the top.
		// Actually I can just write the query assuming users is imported, but let me check if users is imported.
		// I'll just use a direct import to be safe if I can't check easily.
		const { users } = await import('../database/schema/users');
		
		const results = await db.select({
			id: users.id,
			username: users.username,
			fullName: users.fullName,
			profilePictureUrl: users.profilePictureUrl,
			status: follows.status
		})
		.from(follows)
		.innerJoin(users, eq(follows.followerId, users.id))
		.where(eq(follows.followingId, userId));

		return results as any;
	}

	async getFollowingDetails(userId: string): Promise<{id: string; username: string; fullName: string; profilePictureUrl: string | null; status: 'pending' | 'accepted'}[]> {
		const { users } = await import('../database/schema/users');

		const results = await db.select({
			id: users.id,
			username: users.username,
			fullName: users.fullName,
			profilePictureUrl: users.profilePictureUrl,
			status: follows.status
		})
		.from(follows)
		.innerJoin(users, eq(follows.followingId, users.id))
		.where(eq(follows.followerId, userId));

		return results as any;
	}
}
