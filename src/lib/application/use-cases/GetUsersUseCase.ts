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

	async execute(): Promise<UserDTO[]> {
		const users = await this.userRepo.findAll();
		
		return users.map(user => ({
			id: user.id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			roles: user.roles,
			dateOfBirth: user.dateOfBirth
		}));
	}
}
