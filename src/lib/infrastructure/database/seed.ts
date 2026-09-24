import 'dotenv/config';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from './schema/index';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';
import { BCRYPT_SALT_ROUNDS, ADMIN_ROLE, DEFAULT_USER_ROLE } from '$lib/infrastructure/config/constants';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin.ksocial.sveltekit@admin.co.id';
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin.ksocial.sveltekit';

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient, { schema });

async function seedAdminRole(): Promise<string> {
	const existing = await db
		.select()
		.from(schema.roles)
		.where(eq(schema.roles.name, ADMIN_ROLE as RoleNameType))
		.limit(1);

	if (existing.length > 0) {
		console.log('  Admin role already exists, skipping.');
		return existing[0].id;
	}

	const id = randomUUID();
	await db.insert(schema.roles).values({ id, name: ADMIN_ROLE as RoleNameType });
	console.log('  Admin role created.');
	return id;
}

async function seedAdminUser(adminRoleId: string): Promise<void> {
	const existing = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, ADMIN_EMAIL))
		.limit(1);

	if (existing.length > 0) {
		console.log('  Admin user already exists, skipping.');
		return;
	}

	const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);
	const userId = randomUUID();

	await db.insert(schema.users).values({
		id: userId,
		email: ADMIN_EMAIL,
		username: ADMIN_USERNAME,
		passwordHash
	});

	await db.insert(schema.userRoles).values({ userId, roleId: adminRoleId });

	console.log(`  Admin user created: ${ADMIN_EMAIL}`);
}

async function seedRegularUsers(): Promise<void> {
	// First ensure default user role exists
	const roleRows = await db
		.select()
		.from(schema.roles)
		.where(eq(schema.roles.name, DEFAULT_USER_ROLE as RoleNameType))
		.limit(1);

	let userRoleId = '';
	if (roleRows.length > 0) {
		userRoleId = roleRows[0].id;
	} else {
		userRoleId = randomUUID();
		await db.insert(schema.roles).values({ id: userRoleId, name: DEFAULT_USER_ROLE as RoleNameType });
		console.log('  User role created.');
	}

	const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

	const usersToSeed = [
		{
			email: 'user1@example.com',
			username: 'user1',
			fullName: 'User Satu'
		},
		{
			email: 'user2@example.com',
			username: 'user2',
			fullName: 'User Dua'
		},
		{
			email: 'user3@example.com',
			username: 'user3',
			fullName: 'User Tiga'
		},
		{
			email: 'user4@example.com',
			username: 'user4',
			fullName: 'User Empat'
		},
		{
			email: 'user5@example.com',
			username: 'user5',
			fullName: 'User Lima'
		}
	];

	for (const u of usersToSeed) {
		const existing = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, u.email))
			.limit(1);

		if (existing.length === 0) {
			const userId = randomUUID();
			await db.insert(schema.users).values({
				id: userId,
				email: u.email,
				username: u.username,
				fullName: u.fullName,
				passwordHash
			});
			await db.insert(schema.userRoles).values({ userId, roleId: userRoleId });
			console.log(`  User created: ${u.email}`);
		} else {
			console.log(`  User already exists: ${u.email}, skipping.`);
		}
	}
}

async function main(): Promise<void> {
	try {
		console.log('Starting seed...\n');
		console.log('Seeding admin role...');
		const adminRoleId = await seedAdminRole();
		console.log('Seeding admin user...');
		await seedAdminUser(adminRoleId);
		console.log('Seeding regular users...');
		await seedRegularUsers();
		console.log('\nSeed completed successfully.');
	} catch (err) {
		console.error('Seed failed:', err);
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

main();
