import type { IDomainEvent } from './IDomainEvent';

export class UserFollowRequestedEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly followerId: string,
		public readonly followingId: string
	) {
		this.occurredOn = new Date();
	}
}
