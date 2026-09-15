import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';
import { Notification } from '$lib/domain/entities/Notification';

export class GetNotificationsUseCase {
	constructor(private notificationRepo: INotificationRepository) {}

	async execute(userId: string): Promise<Notification[]> {
		return await this.notificationRepo.findByUser(userId);
	}
}
