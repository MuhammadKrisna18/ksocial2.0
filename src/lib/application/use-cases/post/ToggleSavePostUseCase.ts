import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';

export class ToggleSavePostUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(userId: string, postId: string): Promise<boolean> {
		if (!userId || !postId) {
			throw new Error('User ID and Post ID are required');
		}
		return this.postRepository.toggleSave(userId, postId);
	}
}
