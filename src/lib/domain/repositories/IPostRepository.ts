import type { Post } from '../entities/Post';

export interface CreatePostData {
	id: string;
	userId: string;
	content: string;
	media?: { url: string; type: 'image' | 'video' }[];
}

export interface IPostRepository {
	create(data: CreatePostData): Promise<Post>;
	getFeed(): Promise<Post[]>;
}
