import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { IEventDispatcher } from '$lib/application/interfaces/IEventDispatcher';
import { PostDeletedByAdminEvent } from '$lib/domain/events/PostDeletedByAdminEvent';
import { ValidationError, NotFoundError } from '$lib/application/exceptions';

export class AdminDeletePostUseCase {
	constructor(
		private readonly postRepository: IPostRepository,
		private readonly eventDispatcher: IEventDispatcher
	) {}

	async execute(postId: string, adminId: string): Promise<boolean> {
		if (!postId) {
			throw new ValidationError('Post ID is required');
		}

		// Find the post first to get the owner's data (authorId)
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new NotFoundError('Post not found');
		}

		const authorId = post.authorId;
		const snippet = post.content.replace(/\s+/g, ' ').trim().slice(0, 50);

		const deleted = await this.postRepository.deleteByAdmin(postId);
		if (!deleted) {
			throw new NotFoundError('Post could not be deleted');
		}

		// Trigger domain event so notification is automatically sent to the post owner
		await this.eventDispatcher.dispatch(
			'PostDeletedByAdminEvent',
			new PostDeletedByAdminEvent(postId, authorId, adminId, snippet)
		);

		return deleted;
	}
}
