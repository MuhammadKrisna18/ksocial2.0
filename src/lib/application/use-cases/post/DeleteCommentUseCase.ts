import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import { ValidationError, NotFoundError, AuthorizationError } from '$lib/application/exceptions';

export class DeleteCommentUseCase {
	constructor(
		private readonly commentRepository: ICommentRepository,
		private readonly postRepository: IPostRepository
	) {}

	async execute(commentId: string, userId: string): Promise<boolean> {
		if (!commentId || !userId) {
			throw new ValidationError('Comment ID and User ID are required');
		}

		const comment = await this.commentRepository.getCommentById(commentId);
		
		if (!comment) {
			throw new NotFoundError('Comment not found');
		}

		// Authorization: Check if user is comment author
		const isAuthorized = comment.userId === userId;
		
		if (!isAuthorized) {
			throw new AuthorizationError('You are not authorized to delete this comment');
		}

		await this.commentRepository.deleteComment(commentId);
		await this.postRepository.decrementComments(comment.postId);
		return true;
	}
}
