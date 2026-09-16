import { eq, and, desc } from 'drizzle-orm';
import { db } from '../database/client';
import { notifications } from '../database/schema/notifications';
import { Notification } from '$lib/domain/entities/Notification';
import type { INotificationRepository, CreateNotificationData } from '$lib/domain/repositories/INotificationRepository';

export class DrizzleNotificationRepository implements INotificationRepository {
	private mapToEntity(row: typeof notifications.$inferSelect): Notification {
		return new Notification({
			id: row.id,
			userId: row.userId,
			senderId: row.senderId,
			type: row.type,
			resourceId: row.resourceId,
			read: row.read,
			createdAt: row.createdAt
		});
	}

	async create(data: CreateNotificationData): Promise<Notification> {
		const [row] = await db
			.insert(notifications)
			.values({
				id: data.id,
				userId: data.userId,
				senderId: data.senderId,
				type: data.type,
				resourceId: data.resourceId,
				read: false
			})
			.returning();

		return this.mapToEntity(row);
	}

	async findById(id: string): Promise<Notification | null> {
		const rows = await db
			.select()
			.from(notifications)
			.where(eq(notifications.id, id))
			.limit(1);
			
		if (!rows.length) return null;
		return this.mapToEntity(rows[0]);
	}

	async findByUser(userId: string): Promise<Notification[]> {
		const rows = await db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, userId))
			.orderBy(desc(notifications.createdAt));
			
		return rows.map(r => this.mapToEntity(r));
	}

	async markAsRead(id: string): Promise<void> {
		await db
			.update(notifications)
			.set({ read: true })
			.where(eq(notifications.id, id));
	}

	async delete(id: string): Promise<void> {
		await db.delete(notifications).where(eq(notifications.id, id));
	}

	async deleteByDetails(userId: string, senderId: string, type: string): Promise<void> {
		await db
			.delete(notifications)
			.where(
				and(
					eq(notifications.userId, userId),
					eq(notifications.senderId, senderId),
					eq(notifications.type, type)
				)
			);
	}
}
