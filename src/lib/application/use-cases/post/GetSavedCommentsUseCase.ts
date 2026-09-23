import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { CommentDTO } from '$lib/application/dtos/comment.dto';

export class GetSavedCommentsUseCase {
	constructor(private readonly commentRepository: ICommentRepository) {}

	async execute(userId: string): Promise<CommentDTO[]> {
		return await this.commentRepository.getSavedCommentsByUserId(userId);
	}
}
