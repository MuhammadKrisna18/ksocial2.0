import { Comment } from '../entities/Comment';

export interface ICommentRepository {
	addComment(comment: Comment): Promise<void>;
	getCommentsByPostId(postId: string): Promise<Comment[]>;
	deleteComment(commentId: string): Promise<void>;
}
