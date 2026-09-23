import type { IUserRepository, UserSearchResult } from '$lib/domain/repositories/IUserRepository';

export class SearchUsersUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(query: string, currentUserId: string): Promise<UserSearchResult[]> {
		if (!query || query.trim().length === 0) return [];
		return this.userRepository.search(query, currentUserId, 10);
	}
}
