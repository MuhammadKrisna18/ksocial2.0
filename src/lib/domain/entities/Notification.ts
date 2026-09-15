export interface NotificationProps {
	id: string;
	userId: string; // The recipient
	senderId: string; // The user who triggered the notification
	type: string; // e.g. 'follow_request', 'follow_accepted'
	read: boolean;
	createdAt: Date;
}

export class Notification {
	readonly id: string;
	readonly userId: string;
	readonly senderId: string;
	readonly type: string;
	readonly read: boolean;
	readonly createdAt: Date;

	constructor(props: NotificationProps) {
		this.id = props.id;
		this.userId = props.userId;
		this.senderId = props.senderId;
		this.type = props.type;
		this.read = props.read;
		this.createdAt = props.createdAt;
	}
}
