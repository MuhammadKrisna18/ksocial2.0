import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { Post } from '$lib/domain/entities/Post';

export class SharePostUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(postId: string): Promise<Post> {
		return await this.postRepository.incrementShares(postId);
	}
}
