import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { ROLE_NAMES } from '$lib/domain/value-objects/RoleName';

export const roles = pgTable('roles', {
	id: text('id').primaryKey(),
	name: text('name', { enum: ROLE_NAMES }).notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type RoleRow = typeof roles.$inferSelect;
export type NewRoleRow = typeof roles.$inferInsert;
