import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { CommentDTO } from '$lib/application/dtos/comment.dto';

export class GetCommentsUseCase {
	constructor(private readonly commentRepository: ICommentRepository) {}

	async execute(postId: string, userId?: string): Promise<CommentDTO[]> {
		return await this.commentRepository.getCommentsByPostId(postId, userId);
	}
}
