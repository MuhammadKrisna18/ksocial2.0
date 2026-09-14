import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';

export interface UserDTO {
	id: string;
	username: string;
	email: string;
	roles: string[];
}

export class GetUsersUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(): Promise<UserDTO[]> {
		const users = await this.userRepo.findAll();
		
		return users.map(user => ({
			id: user.id,
			username: user.username,
			email: user.email,
			roles: user.roles
		}));
	}
}
