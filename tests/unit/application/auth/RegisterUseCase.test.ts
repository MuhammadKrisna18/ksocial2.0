import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from '$lib/application/use-cases/auth/RegisterUseCase';
import { ConflictError, NotFoundError } from '$lib/application/exceptions';
import { User } from '$lib/domain/entities/User';
import { Email } from '$lib/domain/value-objects/Email';
import { Username } from '$lib/domain/value-objects/Username';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IRoleRepository } from '$lib/domain/repositories/IRoleRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';

describe('RegisterUseCase', () => {
	let useCase: RegisterUseCase;
	let mockUserRepo: Partial<IUserRepository>;
	let mockRoleRepo: Partial<IRoleRepository>;
	let mockHashService: Partial<IHashService>;
	let mockTokenService: Partial<ITokenService>;

	beforeEach(() => {
		mockUserRepo = {
			existsByEmail: vi.fn().mockResolvedValue(false),
			existsByUsername: vi.fn().mockResolvedValue(false),
			create: vi.fn(async (data) =>
				User.create({
					id: data.id,
					fullName: data.fullName,
					email: Email.create(data.email),
					username: Username.create(data.username),
					passwordHash: data.passwordHash,
					roles: ['user'],
					dateOfBirth: data.dateOfBirth,
					isPrivate: false,
					requireFollowForMessage: false,
					createdAt: new Date(),
					updatedAt: new Date()
				})
			)
		};

		mockRoleRepo = {
			findByName: vi.fn().mockResolvedValue({ id: 'role-user-id', name: 'user' })
		};

		mockHashService = {
			hash: vi.fn().mockResolvedValue('hashed_password_123')
		};

		mockTokenService = {
			sign: vi.fn().mockReturnValue('mocked_jwt_token')
		};

		useCase = new RegisterUseCase(
			mockUserRepo as IUserRepository,
			mockRoleRepo as IRoleRepository,
			mockHashService as IHashService,
			mockTokenService as ITokenService
		);
	});

	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi Valid', () => {
			it('EP-R-01: registrasi berhasil dengan data lengkap dan unik', async () => {
				const dto = {
					fullName: 'Muhammad Krisna',
					username: 'krisna18',
					email: 'krisna@example.com',
					password: 'secretPassword123',
					dateOfBirth: new Date('2000-01-01')
				};

				const result = await useCase.execute(dto);

				expect(result.accessToken).toBe('mocked_jwt_token');
				expect(result.user.email).toBe('krisna@example.com');
				expect(result.user.username).toBe('krisna18');
				expect(result.user.roles).toEqual(['user']);

				expect(mockHashService.hash).toHaveBeenCalledWith('secretPassword123');
				expect(mockTokenService.sign).toHaveBeenCalled();
				expect(mockUserRepo.create).toHaveBeenCalled();
			});
		});

		describe('Partisi Konflik Data (Duplikasi)', () => {
			it('EP-R-02: harus melempar ConflictError jika email sudah digunakan', async () => {
				vi.mocked(mockUserRepo.existsByEmail!).mockResolvedValue(true);

				const dto = {
					fullName: 'Muhammad Krisna',
					username: 'krisna18',
					email: 'existing@example.com',
					password: 'secretPassword123',
					dateOfBirth: new Date('2000-01-01')
				};

				await expect(useCase.execute(dto)).rejects.toThrow(ConflictError);
				await expect(useCase.execute(dto)).rejects.toThrow('Email already in use');
				expect(mockUserRepo.create).not.toHaveBeenCalled();
			});

			it('EP-R-03: harus melempar ConflictError jika username sudah digunakan', async () => {
				vi.mocked(mockUserRepo.existsByUsername!).mockResolvedValue(true);

				const dto = {
					fullName: 'Muhammad Krisna',
					username: 'taken_username',
					email: 'newuser@example.com',
					password: 'secretPassword123',
					dateOfBirth: new Date('2000-01-01')
				};

				await expect(useCase.execute(dto)).rejects.toThrow(ConflictError);
				await expect(useCase.execute(dto)).rejects.toThrow('Username already in use');
				expect(mockUserRepo.create).not.toHaveBeenCalled();
			});
		});

		describe('Partisi Konfigurasi Sistem (Default Role)', () => {
			it('EP-R-04: harus melempar NotFoundError jika default role tidak ditemukan di DB', async () => {
				vi.mocked(mockRoleRepo.findByName!).mockResolvedValue(null);

				const dto = {
					fullName: 'Muhammad Krisna',
					username: 'krisna18',
					email: 'krisna@example.com',
					password: 'secretPassword123',
					dateOfBirth: new Date('2000-01-01')
				};

				await expect(useCase.execute(dto)).rejects.toThrow(NotFoundError);
				expect(mockUserRepo.create).not.toHaveBeenCalled();
			});
		});

		describe('Partisi Nilai Domain Batas / Invalid (Integrasi VO)', () => {
			it('EP-R-05: melempar error jika username melanggar batas panjang BVA (panjang 2)', async () => {
				const dto = {
					fullName: 'Muhammad Krisna',
					username: 'ab', // < 3 characters
					email: 'krisna@example.com',
					password: 'secretPassword123',
					dateOfBirth: new Date('2000-01-01')
				};

				await expect(useCase.execute(dto)).rejects.toThrow(
					'Username must be at least 3 characters long'
				);
			});

			it('EP-R-06: melempar error jika email tidak valid', async () => {
				const dto = {
					fullName: 'Muhammad Krisna',
					username: 'krisna18',
					email: 'not-an-email',
					password: 'secretPassword123',
					dateOfBirth: new Date('2000-01-01')
				};

				await expect(useCase.execute(dto)).rejects.toThrow(/Invalid email address/);
			});
		});
	});
});
