import type { Post } from '../entities/Post';

export interface CreatePostData {
	id: string;
	userId: string;
	content: string;
	media?: { url: string; type: 'image' | 'video' }[];
}

export interface PostViewData {
	id: string;
	authorId: string;
	authorName: string;
	authorUsername: string;
	content: string;
	likesCount: number;
	commentsCount: number;
	sharesCount: number;
	media?: { url: string; type: 'image' | 'video' }[];
	isSaved: boolean;
	isLiked: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPostRepository {
	create(data: CreatePostData): Promise<Post>;
	findById(id: string): Promise<Post | null>;
	getFeed(currentUserId?: string): Promise<PostViewData[]>;
	toggleSave(userId: string, postId: string): Promise<boolean>;
	getSavedPosts(userId: string): Promise<PostViewData[]>;
	getUserPosts(userId: string, currentUserId?: string): Promise<PostViewData[]>;
	deletePost(id: string, userId: string): Promise<boolean>;
	incrementShares(id: string): Promise<Post>;
	incrementLikes(postId: string): Promise<void>;
	decrementLikes(postId: string): Promise<void>;
	incrementComments(postId: string): Promise<void>;
	decrementComments(postId: string): Promise<void>;
	getPostLikes(postId: string): Promise<{ id: string; username: string; fullName: string; profilePictureUrl: string | null }[]>;
	count(): Promise<number>;
	deleteByAdmin(postId: string): Promise<boolean>;
}
