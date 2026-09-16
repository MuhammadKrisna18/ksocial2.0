import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { Comment } from '$lib/domain/entities/Comment';

export class GetCommentsUseCase {
	constructor(private readonly commentRepository: ICommentRepository) {}

	async execute(postId: string): Promise<Comment[]> {
		return await this.commentRepository.getCommentsByPostId(postId);
	}
}
