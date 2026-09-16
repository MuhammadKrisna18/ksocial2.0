import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { comments } from './comments';

export const savedComments = pgTable(
	'saved_comments',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		commentId: text('comment_id')
			.notNull()
			.references(() => comments.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.commentId] })
	})
);

export const savedCommentsRelations = relations(savedComments, ({ one }) => ({
	user: one(users, {
		fields: [savedComments.userId],
		references: [users.id]
	}),
	comment: one(comments, {
		fields: [savedComments.commentId],
		references: [comments.id]
	})
}));
