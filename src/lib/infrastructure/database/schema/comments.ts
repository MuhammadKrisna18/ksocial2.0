import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { posts } from './posts';

export const comments = pgTable('comments', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	postId: text('post_id')
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	parentId: text('parent_id')
		.references((): any => comments.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: 'replies'
	}),
	replies: many(comments, { relationName: 'replies' })
}));

export type CommentRow = typeof comments.$inferSelect;
export type NewCommentRow = typeof comments.$inferInsert;
