import type { IDomainEvent } from './IDomainEvent';
import type { Message } from '../entities/Message';

export class MessageSentEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(public readonly message: Message) {
		this.occurredOn = new Date();
	}
}
