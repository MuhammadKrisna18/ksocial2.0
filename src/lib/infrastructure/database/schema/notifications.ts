import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const notifications = pgTable('notifications', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // e.g. 'follow_request', 'follow_accepted'
	read: boolean('read').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: 'notificationUser'
	}),
	sender: one(users, {
		fields: [notifications.senderId],
		references: [users.id],
		relationName: 'notificationSender'
	})
}));
