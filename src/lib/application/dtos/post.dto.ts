import type { PostViewData } from '$lib/domain/repositories/IPostRepository';

export type PostDTO = PostViewData;

export interface CreatePostDTO {
	userId: string;
	content: string;
	media?: { url: string; type: 'image' | 'video' }[];
}
