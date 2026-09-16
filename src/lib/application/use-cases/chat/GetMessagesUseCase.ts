import type { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { Message } from '../../../domain/entities/Message';

export class GetMessagesUseCase {
	constructor(private messageRepo: IMessageRepository) {}

	async execute(userId1: string, userId2: string): Promise<Message[]> {
		const messages = await this.messageRepo.findByParticipants(userId1, userId2);
		
		// Optionally, mark them as read if userId1 is fetching and receiver is userId1
		await this.messageRepo.markAsRead(userId2, userId1);

		return messages;
	}
}
