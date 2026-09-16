import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';
import { UserFollowRequestedEvent } from '$lib/domain/events/UserFollowRequestedEvent';
import { UserFollowAcceptedEvent } from '$lib/domain/events/UserFollowAcceptedEvent';

export class NotificationEventHandler {
	constructor(private notificationRepo: INotificationRepository) {}

	async handleFollowRequested(event: UserFollowRequestedEvent): Promise<void> {
		const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		await this.notificationRepo.create({
			id,
			userId: event.followingId,
			senderId: event.followerId,
			type: 'follow_request'
		});
	}

	async handleFollowAccepted(event: UserFollowAcceptedEvent): Promise<void> {
		if (event.notificationId) {
			await this.notificationRepo.delete(event.notificationId);
		} else {
			await this.notificationRepo.deleteByDetails(event.followingId, event.followerId, 'follow_request');
		}
	}
}
