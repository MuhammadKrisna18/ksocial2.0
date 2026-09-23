import { Comment } from '../entities/Comment';

export interface CommentViewData {
	id: string;
	userId: string;
	postId: string;
	content: string;
	parentId?: string | null;
	createdAt: Date;
	authorName?: string;
	authorUsername?: string;
	authorProfilePicture?: string | null;
	likesCount?: number;
	isLiked?: boolean;
	isSaved?: boolean;
	repliesCount?: number;
	replies?: CommentViewData[];
}

export interface ICommentRepository {
	addComment(comment: Comment): Promise<void>;
	getCommentsByPostId(postId: string, userId?: string): Promise<CommentViewData[]>;
	getCommentById(id: string): Promise<Comment | null>;
	deleteComment(commentId: string): Promise<void>;
	toggleLike(userId: string, commentId: string): Promise<boolean>;
	toggleSave(userId: string, commentId: string): Promise<boolean>;
	getSavedCommentsByUserId(userId: string): Promise<CommentViewData[]>;
}
