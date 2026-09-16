import { db } from '$lib/infrastructure/database/client';
import { users } from '$lib/infrastructure/database/schema/users';
import { or, ilike, eq, not } from 'drizzle-orm';

export class SearchUsersUseCase {
	async execute(query: string, currentUserId: string): Promise<any[]> {
		if (!query || query.trim().length === 0) return [];
		
		const searchPattern = `%${query.trim()}%`;
		
		const results = await db
			.select({
				id: users.id,
				username: users.username,
				fullName: users.fullName,
				bio: users.bio
			})
			.from(users)
			.where(
				or(
					ilike(users.username, searchPattern),
					ilike(users.fullName, searchPattern)
				)
			)
			.limit(10);
			
		return results;
	}
}
