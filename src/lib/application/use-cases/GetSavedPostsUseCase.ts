import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { Post } from '$lib/domain/entities/Post';

export class GetSavedPostsUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(userId: string): Promise<Post[]> {
		if (!userId) {
			throw new Error('User ID is required');
		}
		return this.postRepository.getSavedPosts(userId);
	}
}
