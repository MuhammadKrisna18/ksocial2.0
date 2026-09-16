export class Message {
	constructor(
		public readonly id: string,
		public readonly senderId: string,
		public readonly receiverId: string,
		public readonly content: string,
		public readonly isRead: boolean,
		public readonly createdAt: Date
	) {}

	static create(senderId: string, receiverId: string, content: string): Message {
		return new Message(crypto.randomUUID(), senderId, receiverId, content, false, new Date());
	}

	markAsRead(): Message {
		return new Message(this.id, this.senderId, this.receiverId, this.content, true, this.createdAt);
	}
}
