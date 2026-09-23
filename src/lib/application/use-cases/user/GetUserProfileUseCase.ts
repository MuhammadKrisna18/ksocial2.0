import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import { NotFoundError, ValidationError } from '$lib/application/exceptions';
import type { UserProfileDTO } from '$lib/application/dtos/user.dto';

export interface GetUserProfileInput {
	targetUsername?: string;
	targetUserId?: string;
	currentUserId?: string;
}

export class GetUserProfileUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly followRepo: IFollowRepository
	) {}

	async execute(input: GetUserProfileInput): Promise<UserProfileDTO> {
		let targetUser = null;

		if (input.targetUserId) {
			targetUser = await this.userRepo.findById(input.targetUserId);
		} else if (input.targetUsername) {
			targetUser = await this.userRepo.findByUsername(input.targetUsername);
		} else {
			throw new ValidationError('Target username or target user ID must be provided');
		}

		if (!targetUser) {
			throw new NotFoundError('User not found');
		}

		const isCurrentUser = Boolean(input.currentUserId && input.currentUserId === targetUser.id);

		let followStatus: 'none' | 'pending' | 'following' | 'friends' | 'follows_you' = 'none';

		if (input.currentUserId && !isCurrentUser) {
			const currentFollowsTarget = await this.followRepo.findByUsers(input.currentUserId, targetUser.id);
			const targetFollowsCurrent = await this.followRepo.findByUsers(targetUser.id, input.currentUserId);

			if (!currentFollowsTarget) {
				if (targetFollowsCurrent?.status === 'accepted') {
					followStatus = 'follows_you';
				} else {
					followStatus = 'none';
				}
			} else if (currentFollowsTarget.status === 'pending') {
				followStatus = 'pending';
			} else if (currentFollowsTarget.status === 'accepted' && targetFollowsCurrent?.status === 'accepted') {
				followStatus = 'friends';
			} else {
				followStatus = 'following';
			}
		}

		const followers = await this.followRepo.getFollowers(targetUser.id);
		const following = await this.followRepo.getFollowing(targetUser.id);
		const followersCount = followers.filter(f => f.status === 'accepted').length;
		const followingCount = following.filter(f => f.status === 'accepted').length;

		const canViewPosts = isCurrentUser || !targetUser.isPrivate || followStatus === 'friends' || followStatus === 'following';

		return {
			id: targetUser.id,
			username: targetUser.username.toString(),
			fullName: targetUser.fullName,
			email: targetUser.email.toString(),
			dateOfBirth: targetUser.dateOfBirth,
			location: targetUser.location,
			relationshipStatus: targetUser.relationshipStatus,
			isPrivate: targetUser.isPrivate,
			requireFollowForMessage: targetUser.requireFollowForMessage,
			profilePictureUrl: targetUser.profilePictureUrl,
			coverPhotoUrl: targetUser.coverPhotoUrl,
			followersCount,
			followingCount,
			followStatus,
			isCurrentUser,
			canViewPosts,
			createdAt: targetUser.createdAt
		};
	}
}
