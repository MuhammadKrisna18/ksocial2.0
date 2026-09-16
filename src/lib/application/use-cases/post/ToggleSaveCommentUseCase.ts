import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';

export class ToggleSaveCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	async execute(userId: string, commentId: string): Promise<boolean> {
		return await this.commentRepository.toggleSave(userId, commentId);
	}
}
