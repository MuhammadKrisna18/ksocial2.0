import type { IMessageRepository } from '$lib/domain/repositories/IMessageRepository';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { IEventDispatcher } from '$lib/application/interfaces/IEventDispatcher';
import { Message } from '$lib/domain/entities/Message';
import { MessageSentEvent } from '$lib/domain/events/MessageSentEvent';
import { ValidationError, NotFoundError, AuthorizationError } from '$lib/application/exceptions';

export class SendMessageUseCase {
	constructor(
		private messageRepo: IMessageRepository,
		private userRepo: IUserRepository,
		private followRepo: IFollowRepository,
		private eventDispatcher: IEventDispatcher
	) {}

	async execute(senderId: string, receiverId: string, content: string): Promise<Message> {
		if (!receiverId || senderId === receiverId) {
			throw new ValidationError('You cannot send a message to yourself.');
		}

		const cleanContent = content.trim();
		if (!cleanContent) throw new ValidationError('Message cannot be empty.');
		if (cleanContent.length > 1000) throw new ValidationError('Message is too long. Maximum 1000 characters.');

		const receiver = await this.userRepo.findById(receiverId);
		if (!receiver) throw new NotFoundError('Receiver not found.');

		if (receiver.isPrivate && receiver.requireFollowForMessage) {
			const followStatus = await this.followRepo.getFollowStatus(senderId, receiverId);
			if (followStatus !== 'accepted') {
				throw new AuthorizationError('You must follow this user and be accepted to send a message.');
			}
		}

		const message = Message.create(senderId, receiverId, cleanContent);
		await this.messageRepo.save(message);

		const sender = await this.userRepo.findById(senderId);
		const senderInfo = sender
			? {
					id: sender.id,
					fullName: sender.fullName,
					username: sender.username.toString(),
					avatarUrl: sender.profilePictureUrl
				}
			: undefined;

		await this.eventDispatcher.dispatch('MessageSentEvent', new MessageSentEvent(message, senderInfo));
		return message;
	}

}
