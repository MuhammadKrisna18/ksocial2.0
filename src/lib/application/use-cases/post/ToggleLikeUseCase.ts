import type { ILikeRepository } from '$lib/domain/repositories/ILikeRepository';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { IEventDispatcher } from '$lib/application/interfaces/IEventDispatcher';
import { PostLikedEvent } from '$lib/domain/events/PostLikedEvent';

export class ToggleLikeUseCase {
	constructor(
		private readonly likeRepository: ILikeRepository,
		private readonly postRepository: IPostRepository,
		private readonly eventDispatcher: IEventDispatcher
	) {}

	async execute(userId: string, postId: string): Promise<{ liked: boolean }> {
		const hasLiked = await this.likeRepository.hasLiked(userId, postId);

		if (hasLiked) {
			await this.likeRepository.removeLike(userId, postId);
			await this.postRepository.decrementLikes(postId);
			return { liked: false };
		} else {
			await this.likeRepository.addLike(userId, postId);
			await this.postRepository.incrementLikes(postId);

			const post = await this.postRepository.findById(postId);
			if (post) {
				await this.eventDispatcher.dispatch('PostLikedEvent', new PostLikedEvent(userId, post.authorId, postId));
			}

			return { liked: true };
		}
	}
}
