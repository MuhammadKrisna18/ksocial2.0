import type { Post } from '../entities/Post';

export interface CreatePostData {
	id: string;
	userId: string;
	content: string;
	media?: { url: string; type: 'image' | 'video' }[];
}

export interface IPostRepository {
	create(data: CreatePostData): Promise<Post>;
	findById(id: string): Promise<Post | null>;
	getFeed(currentUserId?: string): Promise<Post[]>;
	toggleSave(userId: string, postId: string): Promise<boolean>;
	getSavedPosts(userId: string): Promise<Post[]>;
	getUserPosts(userId: string, currentUserId?: string): Promise<Post[]>;
	deletePost(id: string, userId: string): Promise<boolean>;
	incrementShares(id: string): Promise<Post>;
	getPostLikes(postId: string): Promise<{id: string; username: string; fullName: string; profilePictureUrl: string | null}[]>;
}
