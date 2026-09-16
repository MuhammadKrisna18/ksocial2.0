import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';

export class GetPostLikesUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(postId: string) {
		return await this.postRepository.getPostLikes(postId);
	}
}
