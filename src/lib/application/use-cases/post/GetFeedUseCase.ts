import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { PostDTO } from '$lib/application/dtos/post.dto';

export class GetFeedUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(currentUserId?: string): Promise<PostDTO[]> {
		return this.postRepository.getFeed(currentUserId);
	}
}
