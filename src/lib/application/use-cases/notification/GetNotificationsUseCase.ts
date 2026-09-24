import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { NotificationDTO } from '$lib/application/dtos/notification.dto';

export class GetNotificationsUseCase {
	constructor(
		private readonly notificationRepo: INotificationRepository,
		private readonly userRepo: IUserRepository
	) {}

	async execute(userId: string): Promise<NotificationDTO[]> {
		const rawNotifications = await this.notificationRepo.findByUser(userId);
		if (rawNotifications.length === 0) {
			return [];
		}

		// Deduplicate: if there are multiple follow_requests from the same sender, keep only the latest one
		const seenFollowRequests = new Set<string>();
		const uniqueNotifications = rawNotifications.filter((n) => {
			if (n.type === 'follow_request') {
				if (seenFollowRequests.has(n.senderId)) {
					void this.notificationRepo.delete(n.id);
					return false;
				}
				seenFollowRequests.add(n.senderId);
			}
			return true;
		});

		const senderIds = Array.from(new Set(uniqueNotifications.map((n) => n.senderId)));
		const sendersMap = new Map<string, { username: string; fullName: string }>();

		await Promise.all(
			senderIds.map(async (senderId) => {
				const sender = await this.userRepo.findById(senderId);
				if (sender) {
					sendersMap.set(senderId, {
						username: sender.username.toString(),
						fullName: sender.fullName
					});
				}
			})
		);

		return uniqueNotifications.map((n) => {
			const sender = sendersMap.get(n.senderId);
			return {
				id: n.id,
				type: n.type,
				senderId: n.senderId,
				senderUsername: sender?.username,
				senderName: sender?.fullName,
				resourceId: n.resourceId,
				read: n.read,
				createdAt: n.createdAt
			};
		});
	}
}
