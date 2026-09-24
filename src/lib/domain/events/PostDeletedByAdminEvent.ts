import type { IDomainEvent } from './IDomainEvent';

export class PostDeletedByAdminEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly postId: string,
		public readonly authorId: string,
		public readonly adminId: string,
		public readonly postSnippet?: string
	) {
		this.occurredOn = new Date();
	}
}
