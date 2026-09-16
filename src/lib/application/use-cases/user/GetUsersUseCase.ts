import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';

export interface UserDTO {
	id: string;
	fullName: string;
	username: string;
	email: string;
	roles: string[];
	dateOfBirth: Date;
}

export class GetUsersUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(excludeUserId?: string): Promise<UserDTO[]> {
		const users = await this.userRepo.findAll();
		
		let filteredUsers = users;
		if (excludeUserId) {
			filteredUsers = users.filter(user => user.id !== excludeUserId);
		}

		return filteredUsers.map(user => ({
			id: user.id,
			fullName: user.fullName,
			username: user.username.toString(),
			email: user.email.toString(),
			roles: user.roles,
			dateOfBirth: user.dateOfBirth
		}));
	}
}
