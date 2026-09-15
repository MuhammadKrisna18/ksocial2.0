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
	readonly status: FollowStatus;
	readonly createdAt: Date;

	constructor(props: FollowProps) {
		this.followerId = props.followerId;
		this.followingId = props.followingId;
		this.status = props.status;
		this.createdAt = props.createdAt;
	}
}
