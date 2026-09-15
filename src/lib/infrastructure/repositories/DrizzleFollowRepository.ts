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

	async updateStatus(followerId: string, followingId: string, status: 'accepted'): Promise<void> {
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
		const rows = await db
			.select()
			.from(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followingId, followingId)
				)
			)
			.limit(1);

		if (!rows.length) return null;
		return this.mapToEntity(rows[0]);
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
}
