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
	console.log('Mencari akun dummy dengan pola email:', DUMMY_EMAIL_PATTERN);

	// Cari akun dummy yang ada
	const dummyUsers = await db
		.select({
			id: schema.users.id,
			username: schema.users.username,
			email: schema.users.email
		})
		.from(schema.users)
		.where(like(schema.users.email, DUMMY_EMAIL_PATTERN));

	if (dummyUsers.length === 0) {
		console.log('Tidak ada akun dummy yang ditemukan. Database bersih.');
		return;
	}

	console.log(`Ditemukan ${dummyUsers.length} akun dummy.`);
	
	// Hapus seluruh akun dummy (ON DELETE CASCADE akan otomatis menghapus postingan, relasi role, komentar, dan like terkait)
	const deleted = await db
		.delete(schema.users)
		.where(like(schema.users.email, DUMMY_EMAIL_PATTERN))
		.returning({ id: schema.users.id, username: schema.users.username });

	console.log(`\nBerhasil menghapus ${deleted.length} akun dummy beserta seluruh postingannya:`);
	for (const u of deleted) {
		console.log(`- Terhapus: @${u.username}`);
	}
	console.log('\nDatabase kembali bersih seperti semula.');
}

async function main(): Promise<void> {
	try {
		await cleanDummyUsers();
	} catch (err) {
		console.error('Gagal menghapus akun dummy:', err);
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

main();
