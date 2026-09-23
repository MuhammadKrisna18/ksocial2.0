import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { PostDTO } from '$lib/application/dtos/post.dto';

export class GetUserPostsUseCase {
	constructor(private postRepository: IPostRepository) {}

	async execute(userId: string, currentUserId?: string): Promise<PostDTO[]> {
		return this.postRepository.getUserPosts(userId, currentUserId);
	}
}
