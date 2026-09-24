import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '../database/client';
import { comments, users, commentLikes, savedComments } from '../database/schema';
import { Comment } from '$lib/domain/entities/Comment';
import type { ICommentRepository, CommentViewData } from '$lib/domain/repositories/ICommentRepository';

export class DrizzleCommentRepository implements ICommentRepository {
	async addComment(comment: Comment): Promise<void> {
		await db.insert(comments).values({
			id: comment.id,
			userId: comment.userId,
			postId: comment.postId,
			content: comment.content,
			parentId: comment.parentId || null,
			createdAt: comment.createdAt
		});
	}

	async getCommentById(id: string): Promise<Comment | null> {
		const result = await db.select()
			.from(comments)
			.where(eq(comments.id, id))
			.limit(1);
			
		if (result.length === 0) return null;
		
		const row = result[0];
		return Comment.create({
			id: row.id,
			userId: row.userId,
			postId: row.postId,
			content: row.content,
			parentId: row.parentId,
			createdAt: row.createdAt
		});
	}

	async getCommentsByPostId(postId: string, userId?: string): Promise<CommentViewData[]> {
		const results = await db.select({
			comment: comments,
			authorName: users.fullName,
			authorUsername: users.username,
			authorProfilePicture: users.profilePictureUrl,
			likesCount: sql<number>`cast(count(distinct ${commentLikes.userId}) as integer)`,
			repliesCount: sql<number>`cast(count(distinct replies.id) as integer)`,
			isLiked: userId ? sql<boolean>`exists(select 1 from ${commentLikes} where ${commentLikes.commentId} = ${comments.id} and ${commentLikes.userId} = ${userId})` : sql<boolean>`false`,
			isSaved: userId ? sql<boolean>`exists(select 1 from ${savedComments} where ${savedComments.commentId} = ${comments.id} and ${savedComments.userId} = ${userId})` : sql<boolean>`false`
		})
		.from(comments)
		.innerJoin(users, eq(comments.userId, users.id))
		.leftJoin(commentLikes, eq(comments.id, commentLikes.commentId))
		.leftJoin(sql`comments as replies`, eq(comments.id, sql`replies.parent_id`))
		.where(eq(comments.postId, postId))
		.groupBy(comments.id, users.id)
		.orderBy(desc(comments.createdAt));

		// Build a flat list first
		const allCommentsMap = new Map<string, CommentViewData>();
		
		const flatComments: CommentViewData[] = results.map(row => {
			const c: CommentViewData = {
				id: row.comment.id,
				userId: row.comment.userId,
				postId: row.comment.postId,
				content: row.comment.content,
				createdAt: row.comment.createdAt,
				parentId: row.comment.parentId,
				authorName: row.authorName || undefined,
				authorUsername: row.authorUsername,
				authorProfilePicture: row.authorProfilePicture,
				likesCount: row.likesCount,
				isLiked: row.isLiked,
				isSaved: row.isSaved,
				repliesCount: row.repliesCount,
				replies: []
			};
			allCommentsMap.set(c.id, c);
			return c;
		});
		
		// Build tree (assuming max 1 level of nesting as requested)
		const rootComments: CommentViewData[] = [];
		for (const c of flatComments) {
			if (c.parentId) {
				let current = allCommentsMap.get(c.parentId);
				// Find root ancestor
				while (current && current.parentId) {
					current = allCommentsMap.get(current.parentId);
				}
				if (current && current.replies) {
					current.replies.push(c);
				}
			} else {
				rootComments.push(c);
			}
		}
		
		// Sort replies by createdAt ascending (oldest first for replies)
		for (const c of rootComments) {
			if (c.replies) {
				c.replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
			}
		}

		return rootComments;
	}

	async deleteComment(commentId: string): Promise<void> {
		await db.delete(comments).where(eq(comments.id, commentId));
	}
	
	async toggleLike(userId: string, commentId: string): Promise<boolean> {
		const existingLike = await db.select()
			.from(commentLikes)
			.where(and(
				eq(commentLikes.userId, userId),
				eq(commentLikes.commentId, commentId)
			))
			.limit(1);

		if (existingLike.length > 0) {
			await db.delete(commentLikes)
				.where(and(
					eq(commentLikes.userId, userId),
					eq(commentLikes.commentId, commentId)
				));
			return false; // unliked
		} else {
			await db.insert(commentLikes).values({
				userId,
				commentId
			});
			return true; // liked
		}
	}
	
	async toggleSave(userId: string, commentId: string): Promise<boolean> {
		const existingSave = await db.select()
			.from(savedComments)
			.where(and(
				eq(savedComments.userId, userId),
				eq(savedComments.commentId, commentId)
			))
			.limit(1);

		if (existingSave.length > 0) {
			await db.delete(savedComments)
				.where(and(
					eq(savedComments.userId, userId),
					eq(savedComments.commentId, commentId)
				));
			return false; // unsaved
		} else {
			await db.insert(savedComments).values({
				userId,
				commentId
			});
			return true; // saved
		}
	}

	async getSavedCommentsByUserId(userId: string): Promise<CommentViewData[]> {
		const results = await db.select({
			comment: comments,
			authorName: users.fullName,
			authorUsername: users.username,
			authorProfilePicture: users.profilePictureUrl,
			likesCount: sql<number>`cast(count(distinct ${commentLikes.userId}) as integer)`,
			isLiked: sql<boolean>`exists(select 1 from ${commentLikes} where ${commentLikes.commentId} = ${comments.id} and ${commentLikes.userId} = ${userId})`,
			isSaved: sql<boolean>`true`
		})
		.from(comments)
		.innerJoin(savedComments, eq(comments.id, savedComments.commentId))
		.innerJoin(users, eq(comments.userId, users.id))
		.leftJoin(commentLikes, eq(comments.id, commentLikes.commentId))
		.where(eq(savedComments.userId, userId))
		.groupBy(comments.id, users.id, savedComments.createdAt)
		.orderBy(desc(savedComments.createdAt));

		return results.map((row): CommentViewData => ({
			id: row.comment.id,
			userId: row.comment.userId,
			postId: row.comment.postId,
			content: row.comment.content,
			createdAt: row.comment.createdAt,
			parentId: row.comment.parentId,
			authorName: row.authorName || undefined,
			authorUsername: row.authorUsername,
			authorProfilePicture: row.authorProfilePicture,
			likesCount: row.likesCount,
			isLiked: row.isLiked,
			isSaved: row.isSaved,
			repliesCount: 0,
			replies: []
		}));
	}

	async count(): Promise<number> {
		const result = await db.select({ count: sql<number>`count(*)::int` }).from(comments);
		return Number(result[0]?.count ?? 0);
	}

	async getRecentComments(limit = 5): Promise<{ id: string; authorUsername: string; content: string; createdAt: Date }[]> {
		const rows = await db
			.select({
				id: comments.id,
				authorUsername: users.username,
				content: comments.content,
				createdAt: comments.createdAt
			})
			.from(comments)
			.innerJoin(users, eq(comments.userId, users.id))
			.orderBy(desc(comments.createdAt))
			.limit(limit);

		return rows;
	}
}
