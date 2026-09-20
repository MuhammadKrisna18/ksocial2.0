import { and, asc, eq, or, sql } from 'drizzle-orm';
import { db } from '../database/client';
import { messages } from '../database/schema/messages';
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

	async findByParticipants(userId1: string, userId2: string, limit = 50, offset = 0): Promise<Message[]> {
		const rows = await db
			.select()
			.from(messages)
			.where(
				or(
					and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
					and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
				)
			)
			.orderBy(asc(messages.createdAt))
			.limit(Math.min(Math.max(limit, 1), 200))
			.offset(Math.max(offset, 0));

		return rows.map((row) => new Message(row.id, row.senderId, row.receiverId, row.content, row.isRead, row.createdAt));
	}

	async getContacts(userId: string): Promise<ChatContact[]> {
		const query = sql`
			WITH ranked_messages AS (
				SELECT
					m.content,
					m.created_at,
					CASE WHEN m.sender_id = ${userId} THEN m.receiver_id ELSE m.sender_id END AS contact_id,
					ROW_NUMBER() OVER (
						PARTITION BY CASE WHEN m.sender_id = ${userId} THEN m.receiver_id ELSE m.sender_id END
						ORDER BY m.created_at DESC
					) AS rn
				FROM messages m
				WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
			), unread_counts AS (
				SELECT sender_id AS contact_id, COUNT(*) AS unread_count
				FROM messages
				WHERE receiver_id = ${userId} AND is_read = false
				GROUP BY sender_id
			)
			SELECT u.id AS "userId", u.username, u.full_name AS "fullName", u.avatar_url AS "avatarUrl",
				rm.content AS "lastMessage", rm.created_at AS "lastMessageAt",
				COALESCE(uc.unread_count, 0) AS "unreadCount"
			FROM users u
			INNER JOIN ranked_messages rm ON u.id = rm.contact_id AND rm.rn = 1
			LEFT JOIN unread_counts uc ON u.id = uc.contact_id
			ORDER BY rm.created_at DESC
		`;

		const result = await db.execute(query);
		return result.map((row) => ({
			userId: row.userId as string,
			username: row.username as string,
			fullName: row.fullName as string,
			avatarUrl: (row.avatarUrl as string | null) ?? null,
			lastMessage: (row.lastMessage as string | null) ?? null,
			lastMessageAt: row.lastMessageAt ? new Date(row.lastMessageAt as string) : null,
			unreadCount: Number(row.unreadCount ?? 0)
		}));
	}

	async markAsRead(senderId: string, receiverId: string): Promise<void> {
		await db
			.update(messages)
			.set({ isRead: true })
			.where(and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId), eq(messages.isRead, false)));
	}
}
