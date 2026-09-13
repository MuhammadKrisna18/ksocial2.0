import type { User } from '$lib/domain/entities/User';

export interface CreateUserData {
	id: string;
	email: string;
	username: string;
	passwordHash: string;
	roleIds: string[];
}

export interface IUserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
	create(data: CreateUserData): Promise<User>;
	existsByEmail(email: string): Promise<boolean>;
	existsByUsername(username: string): Promise<boolean>;
}
