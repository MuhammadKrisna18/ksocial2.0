import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';

export class DeletePostUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(postId: string, userId: string): Promise<boolean> {
		if (!postId || !userId) {
			throw new Error('Post ID and User ID are required');
		}
		const deleted = await this.postRepository.deletePost(postId, userId);
		if (!deleted) {
			throw new Error('Post not found or unauthorized');
		}
		return deleted;
	}
}
