import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '$lib/application/use-cases/auth/LoginUseCase';
import { AuthenticationError } from '$lib/application/exceptions';
import { User } from '$lib/domain/entities/User';
import { Email } from '$lib/domain/value-objects/Email';
import { Username } from '$lib/domain/value-objects/Username';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';

describe('LoginUseCase', () => {
	let useCase: LoginUseCase;
	let mockUserRepo: Partial<IUserRepository>;
	let mockHashService: Partial<IHashService>;
	let mockTokenService: Partial<ITokenService>;

	const sampleUser = User.create({
		id: 'user-123',
		fullName: 'Test User',
		email: Email.create('user@example.com'),
		username: Username.create('user123'),
		passwordHash: '$2a$10$validhashedpassword',
		roles: ['user'],
		dateOfBirth: new Date('1995-05-15'),
		isPrivate: false,
		requireFollowForMessage: false,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	beforeEach(() => {
		mockUserRepo = {
			findByEmail: vi.fn(),
			findByUsername: vi.fn()
		};

		mockHashService = {
			compare: vi.fn().mockResolvedValue(true)
		};

		mockTokenService = {
			sign: vi.fn().mockReturnValue('mocked_jwt_token')
		};

		useCase = new LoginUseCase(
			mockUserRepo as IUserRepository,
			mockHashService as IHashService,
			mockTokenService as ITokenService
		);
	});

	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi Mode Identifier (Email vs Username)', () => {
			it('EP-L-01: login menggunakan email valid mencari via findByEmail', async () => {
				vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(sampleUser);

				const result = await useCase.execute({
					email: 'user@example.com',
					password: 'plainPassword'
				});

				expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('user@example.com');
				expect(mockUserRepo.findByUsername).not.toHaveBeenCalled();
				expect(result.accessToken).toBe('mocked_jwt_token');
				expect(result.user.id).toBe('user-123');
			});

			it('EP-L-02: login menggunakan username (tanpa @) mencari via findByUsername', async () => {
				vi.mocked(mockUserRepo.findByUsername!).mockResolvedValue(sampleUser);

				const result = await useCase.execute({
					email: 'user123',
					password: 'plainPassword'
				});

				expect(mockUserRepo.findByUsername).toHaveBeenCalledWith('user123');
				expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
				expect(result.accessToken).toBe('mocked_jwt_token');
			});

			it('EP-L-03: input mengandung @ namun format email invalid harus melempar AuthenticationError', async () => {
				await expect(
					useCase.execute({
						email: 'invalid@',
						password: 'plainPassword'
					})
				).rejects.toThrow(AuthenticationError);
			});
		});

		describe('Partisi Keberadaan User (User Existence)', () => {
			it('EP-L-04: user tidak ditemukan via email harus melempar AuthenticationError', async () => {
				vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(null);

				await expect(
					useCase.execute({
						email: 'notfound@example.com',
						password: 'plainPassword'
					})
				).rejects.toThrow('Invalid credentials');
				expect(mockHashService.compare).not.toHaveBeenCalled();
			});

			it('EP-L-05: user tidak ditemukan via username harus melempar AuthenticationError', async () => {
				vi.mocked(mockUserRepo.findByUsername!).mockResolvedValue(null);

				await expect(
					useCase.execute({
						email: 'notfound_user',
						password: 'plainPassword'
					})
				).rejects.toThrow('Invalid credentials');
			});
		});

		describe('Partisi Password Verification', () => {
			it('EP-L-06: password salah harus melempar AuthenticationError', async () => {
				vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(sampleUser);
				vi.mocked(mockHashService.compare!).mockResolvedValue(false);

				await expect(
					useCase.execute({
						email: 'user@example.com',
						password: 'wrongPassword'
					})
				).rejects.toThrow('Invalid credentials');
				expect(mockTokenService.sign).not.toHaveBeenCalled();
			});

			it('EP-L-07: password benar harus berhasil menerbitkan token dan data user', async () => {
				vi.mocked(mockUserRepo.findByEmail!).mockResolvedValue(sampleUser);
				vi.mocked(mockHashService.compare!).mockResolvedValue(true);

				const result = await useCase.execute({
					email: 'user@example.com',
					password: 'correctPassword'
				});

				expect(mockHashService.compare).toHaveBeenCalledWith('correctPassword', sampleUser.passwordHash);
				expect(result.accessToken).toBe('mocked_jwt_token');
				expect(result.user.email).toBe('user@example.com');
			});
		});
	});
});
