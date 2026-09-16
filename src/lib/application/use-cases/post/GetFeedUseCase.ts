import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { Post } from '$lib/domain/entities/Post';

export class GetFeedUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(currentUserId?: string): Promise<Post[]> {
		return this.postRepository.getFeed(currentUserId);
	}
}
