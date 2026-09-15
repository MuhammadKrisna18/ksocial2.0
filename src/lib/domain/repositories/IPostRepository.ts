import type { Post } from '../entities/Post';

export interface CreatePostData {
	id: string;
	userId: string;
	content: string;
	media?: { url: string; type: 'image' | 'video' }[];
}

export interface IPostRepository {
	create(data: CreatePostData): Promise<Post>;
	getFeed(currentUserId?: string): Promise<Post[]>;
	toggleSave(userId: string, postId: string): Promise<boolean>;
	getSavedPosts(userId: string): Promise<Post[]>;
	deletePost(postId: string, userId: string): Promise<boolean>;
}
