import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const follows = pgTable('follows', {
	followerId: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	followingId: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	status: text('status').notNull().default('pending'), // 'pending' or 'accepted'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => ({
	pk: primaryKey({ columns: [t.followerId, t.followingId] })
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: 'followerUser'
	}),
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: 'followingUser'
	})
}));
