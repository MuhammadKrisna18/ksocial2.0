import { desc, eq, and } from 'drizzle-orm';
import { db } from '../database/client';
import { posts } from '../database/schema/posts';
import { savedPosts } from '../database/schema/savedPosts';
import { likes } from '../database/schema/likes';
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
				savedByUserId: savedPosts.userId,
				likedByUserId: likes.userId
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.leftJoin(savedPosts, and(
				eq(savedPosts.postId, posts.id),
				currentUserId ? eq(savedPosts.userId, currentUserId) : undefined
			))
			.leftJoin(likes, and(
				eq(likes.postId, posts.id),
				currentUserId ? eq(likes.userId, currentUserId) : undefined
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
				isLiked: !!row.likedByUserId,
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
				},
				likedByUserId: likes.userId
			})
			.from(savedPosts)
			.innerJoin(posts, eq(savedPosts.postId, posts.id))
			.innerJoin(users, eq(posts.userId, users.id))
			.leftJoin(likes, and(
				eq(likes.postId, posts.id),
				eq(likes.userId, userId) // userId is the current user since it's their saved posts
			))
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
				isLiked: !!row.likedByUserId,
				createdAt: row.post.createdAt,
				updatedAt: row.post.updatedAt
			});
		});
	}

	async getUserPosts(userId: string, currentUserId?: string): Promise<Post[]> {
		const results = await db
			.select({
				post: posts,
				author: {
					fullName: users.fullName,
					username: users.username
				},
				savedByUserId: savedPosts.userId,
				likedByUserId: likes.userId
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.leftJoin(savedPosts, and(
				eq(savedPosts.postId, posts.id),
				currentUserId ? eq(savedPosts.userId, currentUserId) : undefined
			))
			.leftJoin(likes, and(
				eq(likes.postId, posts.id),
				currentUserId ? eq(likes.userId, currentUserId) : undefined
			))
			.where(eq(posts.userId, userId))
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
				isLiked: !!row.likedByUserId,
				createdAt: row.post.createdAt,
				updatedAt: row.post.updatedAt
			});
		});
	}


	async deletePost(postId: string, userId: string): Promise<boolean> {
		// First verify if the post exists and belongs to the user
		const postExists = await db.select().from(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
		
		if (postExists.length === 0) {
			return false;
		}

		// Delete from saved_posts first to avoid foreign key constraint violations
		await db.delete(savedPosts).where(eq(savedPosts.postId, postId));
		
		// Then delete the post
		const result = await db.delete(posts).where(eq(posts.id, postId)).returning({ id: posts.id });
		return result.length > 0;
	}

	async incrementShares(id: string): Promise<Post> {
		const result = await db.update(posts)
			.set({
				sharesCount: sql`${posts.sharesCount} + 1`
			})
			.where(eq(posts.id, id))
			.returning();
			
		if (result.length === 0) {
			throw new Error("Post not found");
		}
		
		const post = result[0];
		return Post.create({
			id: post.id,
			authorId: post.userId,
			authorName: '', // we don't need it just to return
			authorUsername: '',
			content: post.content,
			likesCount: post.likesCount,
			commentsCount: post.commentsCount,
			sharesCount: post.sharesCount,
			media: post.media || undefined,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt
		});
	}
}
