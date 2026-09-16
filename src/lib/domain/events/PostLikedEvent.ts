import type { IDomainEvent } from './IDomainEvent';

export class PostLikedEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly likerId: string,
		public readonly authorId: string,
		public readonly postId: string
	) {
		this.occurredOn = new Date();
	}
}
