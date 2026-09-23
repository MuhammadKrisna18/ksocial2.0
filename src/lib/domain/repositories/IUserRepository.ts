import type { User } from '$lib/domain/entities/User';

export interface CreateUserData {
	id: string;
	fullName: string;
	email: string;
	username: string;
	passwordHash: string;
	dateOfBirth: Date;
	roleIds: string[];
	isPrivate?: boolean;
	requireFollowForMessage?: boolean;
	profilePictureUrl?: string | null;
	coverPhotoUrl?: string | null;
	location?: string | null;
	relationshipStatus?: string | null;
}

export interface UserSearchResult {
	id: string;
	username: string;
	fullName: string;
	profilePictureUrl: string | null;
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
	search(query: string, currentUserId: string, limit?: number): Promise<UserSearchResult[]>;
}
