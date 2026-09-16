import { UserFollowAcceptedEvent } from '../events/UserFollowAcceptedEvent';

export type FollowStatus = 'pending' | 'accepted';

export interface FollowProps {
	followerId: string;
	followingId: string;
	status: FollowStatus;
	createdAt: Date;
}

export class Follow {
	readonly followerId: string;
	readonly followingId: string;
	private _status: FollowStatus;
	readonly createdAt: Date;

	constructor(props: FollowProps) {
		this.followerId = props.followerId;
		this.followingId = props.followingId;
		this._status = props.status;
		this.createdAt = props.createdAt;
	}

	get status(): FollowStatus {
		return this._status;
	}

	accept(): UserFollowAcceptedEvent {
		if (this._status === 'accepted') {
			throw new Error('Already accepted');
		}
		this._status = 'accepted';
		return new UserFollowAcceptedEvent(this.followerId, this.followingId);
	}
}
