import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import { NotFoundError, ValidationError } from '$lib/application/exceptions';

export interface UnfollowUserDTO {
	followerId: string;
	followingId?: string;
	followingUsername?: string;
}

export class UnfollowUserUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private userRepo: IUserRepository
	) {}

	async execute(dto: UnfollowUserDTO): Promise<void> {
		if (!dto.followerId) {
			throw new ValidationError('Follower ID is required');
		}

		let targetUserId = dto.followingId;
		if (!targetUserId && dto.followingUsername) {
			const targetUser = await this.userRepo.findByUsername(dto.followingUsername);
			if (!targetUser) {
				throw new NotFoundError('User not found');
			}
			targetUserId = targetUser.id;
		}

		if (!targetUserId) {
			throw new ValidationError('Target user ID or username is required');
		}

		const existingFollow = await this.followRepo.findByUsers(dto.followerId, targetUserId);
		if (!existingFollow) {
			return;
		}

		await this.followRepo.delete(dto.followerId, targetUserId);
	}
}
