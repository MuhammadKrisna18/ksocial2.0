import { desc, eq, and } from 'drizzle-orm';
import { db } from '../database/client';
import { posts } from '../database/schema/posts';
import { savedPosts } from '../database/schema/savedPosts';
import { users } from '../database/schema/users';
import { Post } from '../../domain/entities/Post';
import type { IPostRepository, CreatePostData } from '../../domain/repositories/IPostRepository';

export class DrizzlePostRepository implements IPostRepository {
	async create(data: CreatePostData): Promise<Post> {
		const [postRow] = await db
			.insert(posts)
			.values({
				id: data.id,
				userId: data.userId,
				content: data.content,
				media: data.media || null
			})
			.returning();

		// Fetch user to construct the entity
		const [userRow] = await db.select().from(users).where(eq(users.id, data.userId));
		if (!userRow) {
			throw new Error('User not found');
		}

		return Post.create({
			id: postRow.id,
			authorId: postRow.userId,
			authorName: userRow.fullName,
			authorUsername: userRow.username,
			content: postRow.content,
			likesCount: postRow.likesCount,
			commentsCount: postRow.commentsCount,
			media: postRow.media as any,
			createdAt: postRow.createdAt,
			updatedAt: postRow.updatedAt
		});
	}

	async getFeed(currentUserId?: string): Promise<Post[]> {
		const results = await db
			.select({
				post: posts,
				author: {
					fullName: users.fullName,
					username: users.username
				},
				savedByUserId: savedPosts.userId
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.leftJoin(savedPosts, and(
				eq(savedPosts.postId, posts.id),
				currentUserId ? eq(savedPosts.userId, currentUserId) : undefined
			))
			.orderBy(desc(posts.createdAt));

		return results.map((row) => {
			return Post.create({
				id: row.post.id,
				authorId: row.post.userId,
				authorName: row.author.fullName,
				authorUsername: row.author.username,
				content: row.post.content,
				likesCount: row.post.likesCount,
				commentsCount: row.post.commentsCount,
				media: row.post.media as any,
				isSaved: !!row.savedByUserId,
				createdAt: row.post.createdAt,
				updatedAt: row.post.updatedAt
			});
		});
	}

	async toggleSave(userId: string, postId: string): Promise<boolean> {
		const existing = await db.select().from(savedPosts).where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)));
		if (existing.length > 0) {
			await db.delete(savedPosts).where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)));
			return false;
		} else {
			await db.insert(savedPosts).values({ userId, postId });
			return true;
		}
	}

	async getSavedPosts(userId: string): Promise<Post[]> {
		const results = await db
			.select({
				post: posts,
				author: {
					fullName: users.fullName,
					username: users.username
				}
			})
			.from(savedPosts)
			.innerJoin(posts, eq(savedPosts.postId, posts.id))
			.innerJoin(users, eq(posts.userId, users.id))
			.where(eq(savedPosts.userId, userId))
			.orderBy(desc(savedPosts.createdAt));

		return results.map((row) => {
			return Post.create({
				id: row.post.id,
				authorId: row.post.userId,
				authorName: row.author.fullName,
				authorUsername: row.author.username,
				content: row.post.content,
				likesCount: row.post.likesCount,
				commentsCount: row.post.commentsCount,
				media: row.post.media as any,
				isSaved: true,
				createdAt: row.post.createdAt,
				updatedAt: row.post.updatedAt
			});
		});
	}
}
