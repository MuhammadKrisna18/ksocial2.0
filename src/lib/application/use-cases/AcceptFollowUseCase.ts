import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';

export interface AcceptFollowDTO {
	followerId: string;
	followingId: string; // The user who is accepting the follow request
	notificationId?: string;
}

export class AcceptFollowUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private notificationRepo: INotificationRepository
	) {}

	async execute(dto: AcceptFollowDTO): Promise<void> {
		const existingFollow = await this.followRepo.findByUsers(dto.followerId, dto.followingId);
		if (!existingFollow || existingFollow.status !== 'pending') {
			throw new Error('No pending follow request found');
		}

		await this.followRepo.updateStatus(dto.followerId, dto.followingId, 'accepted');

		if (dto.notificationId) {
			await this.notificationRepo.delete(dto.notificationId);
		} else {
			await this.notificationRepo.deleteByDetails(dto.followingId, dto.followerId, 'follow_request');
		}
	}
}
