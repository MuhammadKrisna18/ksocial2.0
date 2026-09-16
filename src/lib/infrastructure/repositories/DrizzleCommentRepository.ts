import { eq, desc } from 'drizzle-orm';
import { db } from '../database/client';
import { comments, users } from '../database/schema';
import { Comment } from '$lib/domain/entities/Comment';
import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';

export class DrizzleCommentRepository implements ICommentRepository {
	async addComment(comment: Comment): Promise<void> {
		await db.insert(comments).values({
			id: comment.id,
			userId: comment.userId,
			postId: comment.postId,
			content: comment.content,
			createdAt: comment.createdAt
		});
	}

	async getCommentsByPostId(postId: string): Promise<Comment[]> {
		const results = await db.select({
			comment: comments,
			authorName: users.fullName,
			authorUsername: users.username,
			authorProfilePicture: users.profilePictureUrl
		})
		.from(comments)
		.innerJoin(users, eq(comments.userId, users.id))
		.where(eq(comments.postId, postId))
		.orderBy(desc(comments.createdAt));

		return results.map(row => Comment.create({
			id: row.comment.id,
			userId: row.comment.userId,
			postId: row.comment.postId,
			content: row.comment.content,
			createdAt: row.comment.createdAt,
			authorName: row.authorName || undefined,
			authorUsername: row.authorUsername,
			authorProfilePicture: row.authorProfilePicture
		}));
	}

	async deleteComment(commentId: string): Promise<void> {
		await db.delete(comments).where(eq(comments.id, commentId));
	}
}
