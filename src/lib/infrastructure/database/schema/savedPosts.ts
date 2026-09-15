import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { posts } from './posts';

export const savedPosts = pgTable('saved_posts', {
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.postId] })
	};
});

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
	user: one(users, {
		fields: [savedPosts.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [savedPosts.postId],
		references: [posts.id]
	})
}));
