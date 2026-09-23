import type { CommentViewData } from '$lib/domain/repositories/ICommentRepository';

export type CommentDTO = CommentViewData;

export interface AddCommentDTO {
	userId: string;
	postId: string;
	content: string;
	parentId?: string;
}
