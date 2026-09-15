import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import { NotFoundError, ConflictError } from '$lib/application/exceptions';

export interface FollowUserDTO {
	followerId: string;
	followingId: string;
}

export class FollowUserUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private notificationRepo: INotificationRepository,
		private userRepo: IUserRepository
	) {}

	async execute(dto: FollowUserDTO): Promise<{ status: 'pending' | 'accepted' }> {
		if (dto.followerId === dto.followingId) {
			throw new ConflictError('Cannot follow yourself');
		}

		const followingUser = await this.userRepo.findById(dto.followingId);
		if (!followingUser) {
			throw new NotFoundError('User not found');
		}

		const existingFollow = await this.followRepo.findByUsers(dto.followerId, dto.followingId);
		if (existingFollow) {
			throw new ConflictError('Already following or request pending');
		}

		const status = followingUser.isPrivate ? 'pending' : 'accepted';

		await this.followRepo.create({
			followerId: dto.followerId,
			followingId: dto.followingId,
			status
		});

		if (status === 'pending') {
			// Generate a unique string for notification ID (e.g. timestamp + random)
			const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
			await this.notificationRepo.create({
				id,
				userId: dto.followingId,
				senderId: dto.followerId,
				type: 'follow_request'
			});
		}

		return { status };
	}
}
