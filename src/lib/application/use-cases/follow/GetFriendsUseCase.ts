import type { IFollowRepository, FriendUser } from '$lib/domain/repositories/IFollowRepository';
import { ValidationError } from '$lib/application/exceptions';

export class GetFriendsUseCase {
	constructor(private readonly followRepo: IFollowRepository) {}

	async execute(userId: string): Promise<FriendUser[]> {
		if (!userId || typeof userId !== 'string' || !userId.trim()) {
			throw new ValidationError('User ID is required.');
		}

		return await this.followRepo.getFriends(userId);
	}
}
