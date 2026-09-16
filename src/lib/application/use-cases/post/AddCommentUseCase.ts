import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import { Comment } from '$lib/domain/entities/Comment';
import { db } from '$lib/infrastructure/database/client';
import { posts } from '$lib/infrastructure/database/schema/posts';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export class AddCommentUseCase {
	constructor(private readonly commentRepository: ICommentRepository) {}

	async execute(userId: string, postId: string, content: string): Promise<Comment> {
		const comment = Comment.create({
			id: crypto.randomUUID(),
			userId,
			postId,
			content,
			createdAt: new Date()
		});

		await this.commentRepository.addComment(comment);
		
		await db.update(posts)
			.set({ commentsCount: sql`${posts.commentsCount} + 1` })
			.where(eq(posts.id, postId));

		return comment;
	}
}
