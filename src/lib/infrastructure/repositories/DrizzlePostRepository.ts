import { desc, eq, and, sql } from 'drizzle-orm';
import { db } from '../database/client';
import { posts } from '../database/schema/posts';
import { savedPosts } from '../database/schema/savedPosts';
import { likes } from '../database/schema/likes';
import { users } from '../database/schema/users';
import { Post } from '../../domain/entities/Post';
import type { IPostRepository, CreatePostData, PostViewData } from '../../domain/repositories/IPostRepository';

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

		return Post.create({
			id: postRow.id,
			authorId: postRow.userId,
			content: postRow.content,
			likesCount: postRow.likesCount,
			commentsCount: postRow.commentsCount,
			sharesCount: postRow.sharesCount,
			media: postRow.media as any,
			createdAt: postRow.createdAt,
			updatedAt: postRow.updatedAt
		});
	}

	async getFeed(currentUserId?: string): Promise<PostViewData[]> {
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

		return results.map((row): PostViewData => ({
			id: row.post.id,
			authorId: row.post.userId,
			authorName: row.author.fullName,
			authorUsername: row.author.username,
			content: row.post.content,
			likesCount: row.post.likesCount,
			commentsCount: row.post.commentsCount,
			sharesCount: row.post.sharesCount,
			media: row.post.media as any,
			isSaved: !!row.savedByUserId,
			isLiked: !!row.likedByUserId,
			createdAt: row.post.createdAt,
			updatedAt: row.post.updatedAt
		}));
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

	async getSavedPosts(userId: string): Promise<PostViewData[]> {
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
				eq(likes.userId, userId)
			))
			.where(eq(savedPosts.userId, userId))
			.orderBy(desc(savedPosts.createdAt));

		return results.map((row): PostViewData => ({
			id: row.post.id,
			authorId: row.post.userId,
			authorName: row.author.fullName,
			authorUsername: row.author.username,
			content: row.post.content,
			likesCount: row.post.likesCount,
			commentsCount: row.post.commentsCount,
			sharesCount: row.post.sharesCount,
			media: row.post.media as any,
			isSaved: true,
			isLiked: !!row.likedByUserId,
			createdAt: row.post.createdAt,
			updatedAt: row.post.updatedAt
		}));
	}

	async getUserPosts(userId: string, currentUserId?: string): Promise<PostViewData[]> {
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

		return results.map((row): PostViewData => ({
			id: row.post.id,
			authorId: row.post.userId,
			authorName: row.author.fullName,
			authorUsername: row.author.username,
			content: row.post.content,
			likesCount: row.post.likesCount,
			commentsCount: row.post.commentsCount,
			sharesCount: row.post.sharesCount,
			media: row.post.media as any,
			isSaved: !!row.savedByUserId,
			isLiked: !!row.likedByUserId,
			createdAt: row.post.createdAt,
			updatedAt: row.post.updatedAt
		}));
	}

	async findById(id: string): Promise<Post | null> {
		const [row] = await db
			.select()
			.from(posts)
			.where(eq(posts.id, id))
			.limit(1);

		if (!row) return null;

		return Post.create({
			id: row.id,
			authorId: row.userId,
			content: row.content,
			likesCount: row.likesCount,
			commentsCount: row.commentsCount,
			sharesCount: row.sharesCount,
			media: row.media as any,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		});
	}

	async deletePost(postId: string, userId: string): Promise<boolean> {
		const postExists = await db.select().from(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
		
		if (postExists.length === 0) {
			return false;
		}

		await db.delete(savedPosts).where(eq(savedPosts.postId, postId));
		
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
			content: post.content,
			likesCount: post.likesCount,
			commentsCount: post.commentsCount,
			sharesCount: post.sharesCount,
			media: post.media || undefined,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt
		});
	}

	async incrementLikes(postId: string): Promise<void> {
		await db.update(posts)
			.set({ likesCount: sql`${posts.likesCount} + 1` })
			.where(eq(posts.id, postId));
	}

	async decrementLikes(postId: string): Promise<void> {
		await db.update(posts)
			.set({ likesCount: sql`${posts.likesCount} - 1` })
			.where(eq(posts.id, postId));
	}

	async incrementComments(postId: string): Promise<void> {
		await db.update(posts)
			.set({ commentsCount: sql`${posts.commentsCount} + 1` })
			.where(eq(posts.id, postId));
	}

	async decrementComments(postId: string): Promise<void> {
		await db.update(posts)
			.set({ commentsCount: sql`${posts.commentsCount} - 1` })
			.where(eq(posts.id, postId));
	}

	async getPostLikes(postId: string): Promise<{ id: string; username: string; fullName: string; profilePictureUrl: string | null }[]> {
		const results = await db.select({
			id: users.id,
			username: users.username,
			fullName: users.fullName,
			profilePictureUrl: users.profilePictureUrl
		})
		.from(likes)
		.innerJoin(users, eq(likes.userId, users.id))
		.where(eq(likes.postId, postId))
		.orderBy(desc(likes.createdAt));

		return results;
	}
}
