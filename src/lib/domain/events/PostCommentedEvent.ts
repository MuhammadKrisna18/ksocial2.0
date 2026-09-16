import type { IDomainEvent } from './IDomainEvent';

export class PostCommentedEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly commenterId: string,
		public readonly authorId: string,
		public readonly postId: string,
		public readonly commentId: string
	) {
		this.occurredOn = new Date();
	}
}
