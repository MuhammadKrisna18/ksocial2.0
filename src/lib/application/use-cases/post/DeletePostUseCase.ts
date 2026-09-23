import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import { ValidationError, NotFoundError } from '$lib/application/exceptions';

export class DeletePostUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(postId: string, userId: string): Promise<boolean> {
		if (!postId || !userId) {
			throw new ValidationError('Post ID and User ID are required');
		}
		const deleted = await this.postRepository.deletePost(postId, userId);
		if (!deleted) {
			throw new NotFoundError('Post not found or unauthorized');
		}
		return deleted;
	}
}
