import type { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { Message } from '../../../domain/entities/Message';

export class GetMessagesUseCase {
	constructor(private messageRepo: IMessageRepository) {}

	async execute(userId1: string, userId2: string, limit = 50, offset = 0): Promise<Message[]> {
		if (!userId2 || userId1 === userId2) {
			throw new Error('Invalid conversation.');
		}

		const safeLimit = Math.min(Math.max(Math.trunc(limit) || 50, 1), 200);
		const safeOffset = Math.max(Math.trunc(offset) || 0, 0);
		const messages = await this.messageRepo.findByParticipants(userId1, userId2, safeLimit, safeOffset);

		// Reading a conversation marks only messages sent by the other participant as read.
		await this.messageRepo.markAsRead(userId2, userId1);
		return messages;
	}
}
