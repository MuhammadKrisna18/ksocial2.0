import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseAuthUseCase } from '$lib/application/use-cases/auth/FirebaseAuthUseCase';
import { User } from '$lib/domain/entities/User';
import { Email } from '$lib/domain/value-objects/Email';
import { Username } from '$lib/domain/value-objects/Username';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IRoleRepository } from '$lib/domain/repositories/IRoleRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';
import { Role } from '$lib/domain/entities/Role';

describe('FirebaseAuthUseCase', () => {
	let useCase: FirebaseAuthUseCase;
	let mockUserRepo: Partial<IUserRepository>;
	let mockRoleRepo: Partial<IRoleRepository>;
	let mockHashService: Partial<IHashService>;
	let mockTokenService: Partial<ITokenService>;

	const existingUser = User.create({
		id: 'user-existing-1',
		fullName: 'Existing User',
		email: Email.create('existing@gmail.com'),
		username: Username.create('existing_user'),
		passwordHash: 'hashed_password',
		roles: ['user'],
		dateOfBirth: new Date('1998-01-01'),
		isPrivate: false,
		requireFollowForMessage: false,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	const defaultRole = new Role({
		id: 'role-user-id',
		name: 'user',
		createdAt: new Date()
	});

	beforeEach(() => {
		mockUserRepo = {
			findByEmail: vi.fn(),
			existsByUsername: vi.fn().mockResolvedValue(false),
			create: vi.fn()
		};

		mockRoleRepo = {
			findByName: vi.fn().mockResolvedValue(defaultRole)
		};

		mockHashService = {
			hash: vi.fn().mockResolvedValue('hashed_random_pw')
		};

		mockTokenService = {
			sign: vi.fn().mockReturnValue('mocked_jwt_token')
		};

		useCase = new FirebaseAuthUseCase(
			mockUserRepo as IUserRepository,
			mockRoleRepo as IRoleRepository,
			mockHashService as IHashService,
			mockTokenService as ITokenService
		);
	});

	it('should login directly if user already exists in PostgreSQL', async () => {
		vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(existingUser);

		const result = await useCase.execute({
			email: 'existing@gmail.com',
			name: 'Existing User',
			googleUid: 'google-uid-123'
		});

		expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('existing@gmail.com');
		expect(mockUserRepo.create).not.toHaveBeenCalled();
		expect(result.accessToken).toBe('mocked_jwt_token');
		expect(result.user.id).toBe('user-existing-1');
		expect(result.user.email).toBe('existing@gmail.com');
	});

	it('should automatically create a new user if not found in database', async () => {
		vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(null);

		const newlyCreated = User.create({
			id: 'new-user-id',
			fullName: 'New User',
			email: Email.create('newuser@gmail.com'),
			username: Username.create('newuser'),
			passwordHash: 'hashed_random_pw',
			roles: ['user'],
			dateOfBirth: new Date('2000-01-01'),
			isPrivate: false,
			requireFollowForMessage: false,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		vi.mocked(mockUserRepo.create!).mockResolvedValue(newlyCreated);

		const result = await useCase.execute({
			email: 'newuser@gmail.com',
			name: 'New User',
			picture: 'https://example.com/avatar.jpg',
			googleUid: 'google-uid-456'
		});

		expect(mockUserRepo.create).toHaveBeenCalled();
		expect(result.accessToken).toBe('mocked_jwt_token');
		expect(result.user.email).toBe('newuser@gmail.com');
	});

	it('should handle duplicate usernames by appending suffix', async () => {
		vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(null);
		// First check true (exists), second check false
		vi.mocked(mockUserRepo.existsByUsername!)
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(false);

		const newlyCreated = User.create({
			id: 'user-with-suffix',
			fullName: 'John',
			email: Email.create('john@gmail.com'),
			username: Username.create('john_555'),
			passwordHash: 'hashed_random_pw',
			roles: ['user'],
			dateOfBirth: new Date('2000-01-01'),
			isPrivate: false,
			requireFollowForMessage: false,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		vi.mocked(mockUserRepo.create!).mockResolvedValue(newlyCreated);

		const result = await useCase.execute({
			email: 'john@gmail.com',
			name: 'John',
			googleUid: 'google-uid-789'
		});

		expect(mockUserRepo.existsByUsername).toHaveBeenCalledTimes(2);
		expect(result.user.id).toBe('user-with-suffix');
	});
});
