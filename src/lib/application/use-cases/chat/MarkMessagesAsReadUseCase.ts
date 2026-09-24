import type { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { ValidationError } from '$lib/application/exceptions';

export class MarkMessagesAsReadUseCase {
	constructor(private messageRepo: IMessageRepository) {}

	async execute(senderId: string, receiverId: string): Promise<void> {
		if (!senderId || !receiverId) {
			throw new ValidationError('Sender and receiver IDs are required.');
		}
		await this.messageRepo.markAsRead(senderId, receiverId);
	}
}
