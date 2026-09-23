import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { PostDTO } from '$lib/application/dtos/post.dto';

export class GetSavedPostsUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(userId: string): Promise<PostDTO[]> {
		if (!userId) {
			throw new Error('User ID is required');
		}
		return this.postRepository.getSavedPosts(userId);
	}
}
