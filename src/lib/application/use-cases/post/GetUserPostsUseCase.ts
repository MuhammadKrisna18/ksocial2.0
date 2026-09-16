import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { Post } from '$lib/domain/entities/Post';

export class GetUserPostsUseCase {
	constructor(private postRepository: IPostRepository) {}

	async execute(userId: string, currentUserId?: string): Promise<Post[]> {
		return this.postRepository.getUserPosts(userId, currentUserId);
	}
}
