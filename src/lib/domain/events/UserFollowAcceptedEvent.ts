import type { IDomainEvent } from './IDomainEvent';

export class UserFollowAcceptedEvent implements IDomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly followerId: string,
		public readonly followingId: string,
		public readonly notificationId?: string
	) {
		this.occurredOn = new Date();
	}
}
