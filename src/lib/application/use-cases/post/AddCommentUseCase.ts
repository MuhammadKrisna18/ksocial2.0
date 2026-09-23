import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { IEventDispatcher } from '$lib/application/interfaces/IEventDispatcher';
import { Comment } from '$lib/domain/entities/Comment';
import { PostCommentedEvent } from '$lib/domain/events/PostCommentedEvent';
import crypto from 'crypto';

export class AddCommentUseCase {
	constructor(
		private readonly commentRepository: ICommentRepository,
		private readonly postRepository: IPostRepository,
		private readonly eventDispatcher: IEventDispatcher
	) {}

	async execute(userId: string, postId: string, content: string, parentId?: string): Promise<Comment> {
		const comment = Comment.create({
			id: crypto.randomUUID(),
			userId,
			postId,
			content,
			parentId,
			createdAt: new Date()
		});

		await this.commentRepository.addComment(comment);
		await this.postRepository.incrementComments(postId);

		const post = await this.postRepository.findById(postId);
		if (post) {
			await this.eventDispatcher.dispatch('PostCommentedEvent', new PostCommentedEvent(userId, post.authorId, postId, comment.id));
		}

		return comment;
	}
}
