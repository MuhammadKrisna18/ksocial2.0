import { or, and, eq, desc, asc, sql } from 'drizzle-orm';
import { db } from '../database/client';
import { messages } from '../database/schema/messages';
import { users } from '../database/schema/users';
import { Message } from '../../domain/entities/Message';
import type { IMessageRepository, ChatContact } from '../../domain/repositories/IMessageRepository';

export class DrizzleMessageRepository implements IMessageRepository {
	async save(message: Message): Promise<void> {
		await db.insert(messages).values({
			id: message.id,
			senderId: message.senderId,
			receiverId: message.receiverId,
			content: message.content,
			isRead: message.isRead,
			createdAt: message.createdAt
		});
	}

	async findByParticipants(userId1: string, userId2: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
		const rows = await db.select()
			.from(messages)
			.where(
				or(
					and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
					and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
				)
			)
			.orderBy(asc(messages.createdAt))
			// Usually we might want to paginate by offset, but for chat history, we might fetch earlier messages.
			// Let's keep it simple for now without offset/limit or handle it manually.
			// .limit(limit)
			// .offset(offset)
			;

		return rows.map(r => new Message(
			r.id,
			r.senderId,
			r.receiverId,
			r.content,
			r.isRead,
			r.createdAt
		));
	}

	async getContacts(userId: string): Promise<ChatContact[]> {
		// Complex query to get latest message and unread count per contact
		// In PostgreSQL, we can use window functions or DISTINCT ON, but Drizzle doesn't perfectly support DISTINCT ON out of the box nicely typed.
		// Alternatively, we can use a raw query.
		
		const query = sql`
			WITH ContactMessages AS (
				SELECT 
					m.id,
					m.sender_id,
					m.receiver_id,
					m.content,
					m.is_read,
					m.created_at,
					CASE 
						WHEN m.sender_id = ${userId} THEN m.receiver_id 
						ELSE m.sender_id 
					END as contact_id
				FROM messages m
				WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
			),
			LatestMessages AS (
				SELECT 
					contact_id,
					content as last_message,
					created_at as last_message_at,
					ROW_NUMBER() OVER(PARTITION BY contact_id ORDER BY created_at DESC) as rn
				FROM ContactMessages
			),
			UnreadCounts AS (
				SELECT 
					sender_id as contact_id,
					COUNT(*) as unread_count
				FROM messages
				WHERE receiver_id = ${userId} AND is_read = false
				GROUP BY sender_id
			)
			SELECT 
				u.id as "userId",
				u.username,
				u.full_name as "fullName",
				u.avatar_url as "avatarUrl",
				lm.last_message as "lastMessage",
				lm.last_message_at as "lastMessageAt",
				COALESCE(uc.unread_count, 0) as "unreadCount"
			FROM users u
			INNER JOIN LatestMessages lm ON u.id = lm.contact_id AND lm.rn = 1
			LEFT JOIN UnreadCounts uc ON u.id = uc.contact_id
			ORDER BY lm.last_message_at DESC
		`;

		const result = await db.execute(query);
		
		return result.map(row => ({
			userId: row.userId as string,
			username: row.username as string,
			fullName: row.fullName as string,
			avatarUrl: row.avatarUrl as string | null,
			lastMessage: row.lastMessage as string,
			lastMessageAt: new Date(row.lastMessageAt as string),
			unreadCount: Number(row.unreadCount)
		}));
	}

	async markAsRead(senderId: string, receiverId: string): Promise<void> {
		await db.update(messages)
			.set({ isRead: true })
			.where(
				and(
					eq(messages.senderId, senderId),
					eq(messages.receiverId, receiverId),
					eq(messages.isRead, false)
				)
			);
	}
}
