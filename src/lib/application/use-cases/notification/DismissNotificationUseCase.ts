import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';
import { ValidationError, NotFoundError } from '$lib/application/exceptions';

export class DismissNotificationUseCase {
	constructor(private readonly notificationRepo: INotificationRepository) {}

	async execute(notificationId: string, userId: string): Promise<void> {
		if (!notificationId || !userId) {
			throw new ValidationError('Notification ID and User ID are required');
		}

		const notification = await this.notificationRepo.findById(notificationId);
		if (!notification) {
			// Already deleted or not found, return smoothly
			return;
		}

		if (notification.userId !== userId) {
			throw new ValidationError('Unauthorized to dismiss this notification');
		}

		await this.notificationRepo.delete(notificationId);
	}
}
