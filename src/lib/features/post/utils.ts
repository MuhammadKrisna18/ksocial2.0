export interface PostAuthorCheckParams {
	authorId: string;
	authorUsername?: string;
	currentUser?: {
		sub?: string;
		id?: string;
		username?: string;
	} | null;
}

/**
 * Checks whether the post was created by the currently logged-in user
 */
export function isOwnPost(params: PostAuthorCheckParams): boolean {
	const { authorId, authorUsername, currentUser } = params;
	if (!currentUser) return false;

	if (currentUser.sub && currentUser.sub === authorId) return true;
	if (currentUser.id && currentUser.id === authorId) return true;
	if (currentUser.username && authorUsername && currentUser.username === authorUsername) return true;

	return false;
}
