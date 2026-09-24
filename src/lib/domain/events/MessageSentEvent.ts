import type { IDomainEvent } from './IDomainEvent';
import type { Message } from '../entities/Message';

export interface MessageSenderInfo {
	id: string;
	fullName: string;
	username: string;
	avatarUrl: string | null;
}

export class MessageSentEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly message: Message,
		public readonly sender?: MessageSenderInfo
	) {
		this.occurredOn = new Date();
	}
}

