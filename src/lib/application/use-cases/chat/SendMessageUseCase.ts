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
		if (!receiverId || senderId === receiverId) {
			throw new Error('You cannot send a message to yourself.');
		}

		const cleanContent = content.trim();
		if (!cleanContent) throw new Error('Message cannot be empty.');
		if (cleanContent.length > 1000) throw new Error('Message is too long. Maximum 1000 characters.');

		const receiver = await this.userRepo.findById(receiverId);
		if (!receiver) throw new Error('Receiver not found.');

		if (receiver.isPrivate && receiver.requireFollowForMessage) {
			const followStatus = await this.followRepo.getFollowStatus(senderId, receiverId);
			if (followStatus !== 'accepted') {
				throw new Error('You must follow this user and be accepted to send a message.');
			}
		}

		const message = Message.create(senderId, receiverId, cleanContent);
		await this.messageRepo.save(message);
		await eventDispatcher.dispatch('MessageSentEvent', new MessageSentEvent(message));
		return message;
	}
}
