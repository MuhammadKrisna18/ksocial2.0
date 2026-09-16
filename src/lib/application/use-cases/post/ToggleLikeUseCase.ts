import type { ILikeRepository } from '$lib/domain/repositories/ILikeRepository';
import { db } from '$lib/infrastructure/database/client';
import { posts } from '$lib/infrastructure/database/schema/posts';
import { eq, sql } from 'drizzle-orm';

export class ToggleLikeUseCase {
	constructor(private readonly likeRepository: ILikeRepository) {}

	async execute(userId: string, postId: string): Promise<{ liked: boolean }> {
		const hasLiked = await this.likeRepository.hasLiked(userId, postId);

		if (hasLiked) {
			await this.likeRepository.removeLike(userId, postId);
			await db.update(posts)
				.set({ likesCount: sql`${posts.likesCount} - 1` })
				.where(eq(posts.id, postId));
			return { liked: false };
		} else {
			await this.likeRepository.addLike(userId, postId);
			await db.update(posts)
				.set({ likesCount: sql`${posts.likesCount} + 1` })
				.where(eq(posts.id, postId));
			return { liked: true };
		}
	}
}
