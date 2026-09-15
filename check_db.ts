import { db } from './src/lib/infrastructure/database/client';
import { sql } from 'drizzle-orm';

async function main() {
	try {
		const result = await db.execute(sql`SELECT * FROM notifications LIMIT 1`);
		console.log('Success! Found rows or table exists. Rows:', result);
	} catch (e) {
		console.error('Error querying notifications:', e);
	}
	process.exit(0);
}

main();
