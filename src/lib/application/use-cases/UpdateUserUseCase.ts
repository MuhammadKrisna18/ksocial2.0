import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { HashService } from '$lib/infrastructure/external-services/HashService';
import { User } from '$lib/domain/entities/User';
import { NotFoundError, ConflictError, AuthenticationError } from '$lib/application/exceptions';
import { Username } from '$lib/domain/value-objects/Username';
import { Password } from '$lib/domain/value-objects/Password';

export interface UpdateUsernameDTO {
	userId: string;
	newUsername: string;
}

export interface UpdateProfileDTO {
	userId: string;
	fullName: string;
	newUsername: string;
	dateOfBirth?: Date;
	location?: string;
	relationshipStatus?: string;
	isPrivate?: boolean;
}

export interface UpdatePasswordDTO {
	userId: string;
	oldPassword?: string;
	newPassword: string;
}

export interface UpdatePrivacyDTO {
	userId: string;
	isPrivate: boolean;
}

export interface UpdatePhotosDTO {
	userId: string;
	profilePictureUrl?: string | null;
	coverPhotoUrl?: string | null;
}

export class UpdateUserUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly hashService: HashService
	) {}

	async updateUsername(dto: UpdateUsernameDTO): Promise<void> {
		const user = await this.userRepo.findById(dto.userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		const username = Username.create(dto.newUsername);

		if (user.username.toString() !== username.toString()) {
			const exists = await this.userRepo.existsByUsername(username.toString());
			if (exists) {
				throw new ConflictError('Username already taken');
			}
			await this.userRepo.update(user.id, { username: username.toString() });
		}
	}

	async updateProfile(dto: UpdateProfileDTO): Promise<void> {
		const user = await this.userRepo.findById(dto.userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		const username = Username.create(dto.newUsername);

		if (user.username.toString() !== username.toString()) {
			const exists = await this.userRepo.existsByUsername(username.toString());
			if (exists) {
				throw new ConflictError('Username already taken');
			}
		}

		await this.userRepo.update(user.id, {
			fullName: dto.fullName,
			username: username.toString(),
			...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth }),
			...(dto.location !== undefined && { location: dto.location }),
			...(dto.relationshipStatus !== undefined && { relationshipStatus: dto.relationshipStatus }),
			...(dto.isPrivate !== undefined && { isPrivate: dto.isPrivate })
		});
	}

	async updatePassword(dto: UpdatePasswordDTO): Promise<void> {
		const user = await this.userRepo.findById(dto.userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		if (dto.oldPassword) {
			const isValid = await this.hashService.compare(dto.oldPassword, user.passwordHash);
			if (!isValid) {
				throw new AuthenticationError('Invalid old password');
			}
		}

		const password = Password.createRaw(dto.newPassword);
		const passwordHash = await this.hashService.hash(password.toString());

		await this.userRepo.update(user.id, { passwordHash });
	}

	async updatePrivacy(dto: UpdatePrivacyDTO): Promise<void> {
		const user = await this.userRepo.findById(dto.userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		await this.userRepo.update(user.id, { isPrivate: dto.isPrivate });
	}

	async updatePhotos(dto: UpdatePhotosDTO): Promise<void> {
		const user = await this.userRepo.findById(dto.userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		await this.userRepo.update(user.id, {
			...(dto.profilePictureUrl !== undefined && { profilePictureUrl: dto.profilePictureUrl }),
			...(dto.coverPhotoUrl !== undefined && { coverPhotoUrl: dto.coverPhotoUrl })
		});
	}
}
