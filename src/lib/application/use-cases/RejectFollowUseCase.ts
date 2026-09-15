import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';

export interface RejectFollowDTO {
	followerId: string;
	followingId: string; // The user who is rejecting the follow request
	notificationId?: string;
}

export class RejectFollowUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private notificationRepo: INotificationRepository
	) {}

	async execute(dto: RejectFollowDTO): Promise<void> {
		const existingFollow = await this.followRepo.findByUsers(dto.followerId, dto.followingId);
		if (existingFollow && existingFollow.status === 'pending') {
			await this.followRepo.delete(dto.followerId, dto.followingId);
		}

		if (dto.notificationId) {
			await this.notificationRepo.delete(dto.notificationId);
		} else {
			await this.notificationRepo.deleteByDetails(dto.followingId, dto.followerId, 'follow_request');
		}
	}
}
