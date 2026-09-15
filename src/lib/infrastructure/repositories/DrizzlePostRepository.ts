import { desc, eq } from 'drizzle-orm';
import { db } from '../database/client';
import { posts } from '../database/schema/posts';
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
				content: data.content
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
			createdAt: postRow.createdAt,
			updatedAt: postRow.updatedAt
		});
	}

	async getFeed(): Promise<Post[]> {
		const results = await db
			.select({
				post: posts,
				author: {
					fullName: users.fullName,
					username: users.username
				}
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
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
				createdAt: row.post.createdAt,
				updatedAt: row.post.updatedAt
			});
		});
	}
}
