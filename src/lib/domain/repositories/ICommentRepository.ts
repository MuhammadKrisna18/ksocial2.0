import { Comment } from '../entities/Comment';

export interface ICommentRepository {
	addComment(comment: Comment): Promise<void>;
	getCommentsByPostId(postId: string, userId?: string): Promise<Comment[]>;
	getCommentById(id: string): Promise<Comment | null>;
	deleteComment(commentId: string): Promise<void>;
	toggleLike(userId: string, commentId: string): Promise<boolean>;
	toggleSave(userId: string, commentId: string): Promise<boolean>;
	getSavedCommentsByUserId(userId: string): Promise<Comment[]>;
}
