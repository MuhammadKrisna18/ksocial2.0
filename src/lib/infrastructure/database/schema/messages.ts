import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const messages = pgTable('messages', {
	id: text('id').primaryKey(),
	senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	receiverId: text('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	isRead: boolean('is_read').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const messagesRelations = relations(messages, ({ one }) => ({
	sender: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: 'senderMessages'
	}),
	receiver: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: 'receiverMessages'
	})
}));

export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;
