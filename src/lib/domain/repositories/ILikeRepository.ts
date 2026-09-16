export interface ILikeRepository {
	addLike(userId: string, postId: string): Promise<void>;
	removeLike(userId: string, postId: string): Promise<void>;
	hasLiked(userId: string, postId: string): Promise<boolean>;
}
