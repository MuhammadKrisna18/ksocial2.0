import type { User } from '$lib/domain/entities/User';

interface CreateUserData {
	id: string;
	fullName: string;
	email: string;
	username: string;
	passwordHash: string;
	dateOfBirth: Date;
	roleIds: string[];
	isPrivate?: boolean;
}

export interface IUserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
	create(data: CreateUserData): Promise<User>;
	existsByEmail(email: string): Promise<boolean>;
	existsByUsername(username: string): Promise<boolean>;
	update(id: string, data: Partial<Omit<CreateUserData, 'id' | 'roleIds'>>): Promise<User>;
	delete(id: string): Promise<void>;
	count(): Promise<number>;
	findAll(): Promise<User[]>;
}
