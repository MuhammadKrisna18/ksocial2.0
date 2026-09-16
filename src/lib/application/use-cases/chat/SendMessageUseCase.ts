import type { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { IFollowRepository } from '../../../domain/repositories/IFollowRepository';
import { Message } from '../../../domain/entities/Message';
import { MessageSentEvent } from '../../../domain/events/MessageSentEvent';
import { eventDispatcher } from '../../../infrastructure/events/DomainEventDispatcher';

export class SendMessageUseCase {
	constructor(
		private messageRepo: IMessageRepository,
		private userRepo: IUserRepository,
		private followRepo: IFollowRepository
	) {}

	async execute(senderId: string, receiverId: string, content: string): Promise<Message> {
		if (senderId === receiverId) {
			throw new Error("You cannot send a message to yourself.");
		}
		
		const receiver = await this.userRepo.findById(receiverId);
		if (!receiver) {
			throw new Error("Receiver not found.");
		}

		// Privacy Check
		if (receiver.isPrivate && receiver.requireFollowForMessage) {
			// Check if sender follows receiver and it's accepted
			const followStatus = await this.followRepo.getFollowStatus(senderId, receiverId);
			if (followStatus !== 'accepted') {
				throw new Error("You must follow this user and be accepted to send a message.");
			}
		}

		const message = Message.create(senderId, receiverId, content);
		await this.messageRepo.save(message);

		// Emit event for real-time (SSE) listening
		eventDispatcher.dispatch('MessageSentEvent', new MessageSentEvent(message));

		return message;
	}
}
