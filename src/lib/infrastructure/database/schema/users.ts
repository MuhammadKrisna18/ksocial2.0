import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { posts } from './posts';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	fullName: text('full_name').notNull().default(''),
	email: text('email').notNull().unique(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	dateOfBirth: timestamp('date_of_birth', { withTimezone: true }).notNull().defaultNow(),
	isPrivate: boolean('is_private').notNull().default(false),
	profilePictureUrl: text('profile_picture_url'),
	coverPhotoUrl: text('cover_photo_url'),
	location: text('location'),
	relationshipStatus: text('relationship_status'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts)
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
