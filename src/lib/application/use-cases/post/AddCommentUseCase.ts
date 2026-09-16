import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import { Comment } from '$lib/domain/entities/Comment';
import { db } from '$lib/infrastructure/database/client';
import { posts } from '$lib/infrastructure/database/schema/posts';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import { PostCommentedEvent } from '$lib/domain/events/PostCommentedEvent';

export class AddCommentUseCase {
	constructor(
		private readonly commentRepository: ICommentRepository,
		private readonly postRepository: IPostRepository
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
		
		await db.update(posts)
			.set({ commentsCount: sql`${posts.commentsCount} + 1` })
			.where(eq(posts.id, postId));

		const post = await this.postRepository.findById(postId);
		if (post) {
			await eventDispatcher.dispatch('PostCommentedEvent', new PostCommentedEvent(userId, post.authorId, postId, comment.id));
		}

		return comment;
	}
}
