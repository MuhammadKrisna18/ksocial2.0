import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { Comment } from '$lib/domain/entities/Comment';

export class GetSavedCommentsUseCase {
	constructor(private readonly commentRepository: ICommentRepository) {}

	async execute(userId: string): Promise<Comment[]> {
		return await this.commentRepository.getSavedCommentsByUserId(userId);
	}
}
