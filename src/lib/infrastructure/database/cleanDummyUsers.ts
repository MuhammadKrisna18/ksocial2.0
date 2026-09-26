import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { like } from 'drizzle-orm';
import * as schema from './schema/index';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient, { schema });

const DUMMY_EMAIL_PATTERN = '%@dummy.ksocial.test';

async function cleanDummyUsers(): Promise<void> {
	console.log('Searching for dummy accounts with email pattern:', DUMMY_EMAIL_PATTERN);

	// Find existing dummy accounts
	const dummyUsers = await db
		.select({
			id: schema.users.id,
			username: schema.users.username,
			email: schema.users.email
		})
		.from(schema.users)
		.where(like(schema.users.email, DUMMY_EMAIL_PATTERN));

	if (dummyUsers.length === 0) {
		console.log('No dummy accounts found. Database is clean.');
		return;
	}

	console.log(`Found ${dummyUsers.length} dummy accounts.`);
	
	// Delete all dummy accounts (ON DELETE CASCADE will automatically delete related posts, roles, comments, and likes)
	const deleted = await db
		.delete(schema.users)
		.where(like(schema.users.email, DUMMY_EMAIL_PATTERN))
		.returning({ id: schema.users.id, username: schema.users.username });

	console.log(`\nSuccessfully deleted ${deleted.length} dummy accounts along with all related posts:`);
	for (const u of deleted) {
		console.log(`- Deleted: @${u.username}`);
	}
	console.log('\nDatabase is clean again.');
}

async function main(): Promise<void> {
	try {
		await cleanDummyUsers();
	} catch (err) {
		console.error('Failed to clean dummy accounts:', err);
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

main();
