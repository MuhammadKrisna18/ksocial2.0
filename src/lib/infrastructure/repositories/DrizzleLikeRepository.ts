import { eq, and } from 'drizzle-orm';
import { db } from '../database/client';
import { likes } from '../database/schema';
import type { ILikeRepository } from '$lib/domain/repositories/ILikeRepository';

export class DrizzleLikeRepository implements ILikeRepository {
	async addLike(userId: string, postId: string): Promise<void> {
		await db.insert(likes).values({
			userId,
			postId
		}).onConflictDoNothing();
	}

	async removeLike(userId: string, postId: string): Promise<void> {
		await db.delete(likes).where(
			and(
				eq(likes.userId, userId),
				eq(likes.postId, postId)
			)
		);
	}

	async hasLiked(userId: string, postId: string): Promise<boolean> {
		const result = await db.select().from(likes).where(
			and(
				eq(likes.userId, userId),
				eq(likes.postId, postId)
			)
		).limit(1);

		return result.length > 0;
	}
}
