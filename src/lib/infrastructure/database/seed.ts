import 'dotenv/config';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from './schema/index';
import { ROLE_NAMES, type RoleNameType } from '$lib/domain/value-objects/RoleName';
import { BCRYPT_SALT_ROUNDS, ADMIN_ROLE } from '$lib/infrastructure/config/constants';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');

const ADMIN_EMAIL =
	process.env.SEED_ADMIN_EMAIL ?? 'admin.ksocial.sveltekit@admin.co.id';
const ADMIN_USERNAME =
	process.env.SEED_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD =
	process.env.SEED_ADMIN_PASSWORD ?? 'admin.ksocial.sveltekit';

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient, { schema });

async function seedRoles(): Promise<void> {
	console.log('Seeding roles...');

	const existingRoles = await db.select().from(schema.roles);
	const existingNames = new Set(existingRoles.map((r) => r.name));

	for (const name of ROLE_NAMES) {
		if (existingNames.has(name)) {
			console.log(`  Role "${name}" already exists, skipping.`);
			continue;
		}
		await db.insert(schema.roles).values({ id: randomUUID(), name });
		console.log(`  Role "${name}" created.`);
	}
}

async function seedAdminUser(): Promise<void> {
	console.log('Seeding admin user...');

	const existing = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, ADMIN_EMAIL))
		.limit(1);

	if (existing.length > 0) {
		console.log('  Admin user already exists, skipping.');
		return;
	}

	const adminRole = await db
		.select()
		.from(schema.roles)
		.where(eq(schema.roles.name, ADMIN_ROLE as RoleNameType))
		.limit(1);

	if (!adminRole.length) {
		throw new Error('Admin role not found. Roles must be seeded first.');
	}

	const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);
	const userId = randomUUID();

	await db.insert(schema.users).values({
		id: userId,
		email: ADMIN_EMAIL,
		username: ADMIN_USERNAME,
		passwordHash
	});

	await db.insert(schema.userRoles).values({
		userId,
		roleId: adminRole[0].id
	});

	console.log(`  Admin user created: ${ADMIN_EMAIL}`);
}

async function main(): Promise<void> {
	try {
		console.log('Starting seed...\n');
		await seedRoles();
		await seedAdminUser();
		console.log('\nSeed completed successfully.');
	} catch (err) {
		console.error('Seed failed:', err);
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

main();
