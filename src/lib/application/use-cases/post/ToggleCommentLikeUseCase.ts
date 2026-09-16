import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';

export class ToggleCommentLikeUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	async execute(userId: string, commentId: string): Promise<boolean> {
		return await this.commentRepository.toggleLike(userId, commentId);
	}
}
