import { Message } from '../entities/Message';

export interface ChatContact {
	userId: string;
	username: string;
	fullName: string;
	avatarUrl: string | null;
	lastMessage: string | null;
	lastMessageAt: Date | null;
	unreadCount: number;
}

export interface IMessageRepository {
	save(message: Message): Promise<void>;
	findByParticipants(
		userId1: string,
		userId2: string,
		limit?: number,
		offset?: number
	): Promise<Message[]>;
	getContacts(userId: string): Promise<ChatContact[]>;
	markAsRead(senderId: string, receiverId: string): Promise<void>;
	getUnreadCount(userId: string): Promise<number>;
	count(): Promise<number>;
}

