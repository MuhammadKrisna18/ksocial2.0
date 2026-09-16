import type { ILikeRepository } from '$lib/domain/repositories/ILikeRepository';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import { db } from '$lib/infrastructure/database/client';
import { posts } from '$lib/infrastructure/database/schema/posts';
import { eq, sql } from 'drizzle-orm';
import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import { PostLikedEvent } from '$lib/domain/events/PostLikedEvent';

export class ToggleLikeUseCase {
	constructor(
		private readonly likeRepository: ILikeRepository,
		private readonly postRepository: IPostRepository
	) {}

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

			const post = await this.postRepository.findById(postId);
			if (post) {
				await eventDispatcher.dispatch('PostLikedEvent', new PostLikedEvent(userId, post.authorId, postId));
			}

			return { liked: true };
		}
	}
}
