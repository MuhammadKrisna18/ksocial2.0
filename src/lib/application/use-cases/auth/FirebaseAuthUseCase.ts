import { randomUUID } from 'crypto';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IRoleRepository } from '$lib/domain/repositories/IRoleRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';
import { DEFAULT_USER_ROLE } from '$lib/domain/value-objects/RoleName';
import { Email } from '$lib/domain/value-objects/Email';
import { Username } from '$lib/domain/value-objects/Username';
import type { AuthResponseDTO } from '$lib/application/dtos/auth.dto';
import { NotFoundError } from '$lib/application/exceptions';

export interface FirebaseUserData {
	email: string;
	name?: string;
	picture?: string;
	googleUid: string;
}

export class FirebaseAuthUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly roleRepo: IRoleRepository,
		private readonly hashService: IHashService,
		private readonly tokenService: ITokenService
	) {}

	async execute(firebaseData: FirebaseUserData): Promise<AuthResponseDTO> {
		const emailObj = Email.create(firebaseData.email);
		const emailStr = emailObj.toString();

		let user = await this.userRepo.findByEmail(emailStr);

		if (!user) {
			let rawBase = (firebaseData.email.split('@')[0] || 'user').toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
			if (rawBase.length < 3) rawBase = `user_${rawBase}`;
			if (rawBase.length > 25) rawBase = rawBase.slice(0, 25);

			let candidateUsername = rawBase;
			let attempts = 0;
			while (await this.userRepo.existsByUsername(candidateUsername)) {
				attempts++;
				candidateUsername = `${rawBase}_${Math.floor(100 + Math.random() * 900)}`;
				if (attempts > 10) {
					candidateUsername = `user_${randomUUID().slice(0, 8)}`;
					break;
				}
			}

			const validUsername = Username.create(candidateUsername);
			const defaultRole = await this.roleRepo.findByName(DEFAULT_USER_ROLE);
			if (!defaultRole) {
				throw new NotFoundError('Default user role not found.');
			}

			const randomPassword = randomUUID();
			const passwordHash = await this.hashService.hash(randomPassword);

			user = await this.userRepo.create({
				id: randomUUID(),
				fullName: firebaseData.name?.trim() || validUsername.toString(),
				email: emailStr,
				username: validUsername.toString(),
				passwordHash,
				dateOfBirth: new Date('2000-01-01'),
				profilePictureUrl: firebaseData.picture || undefined,
				roleIds: [defaultRole.id]
			});
		}

		const accessToken = this.tokenService.sign({
			sub: user.id,
			email: user.email.toString(),
			username: user.username.toString(),
			roles: user.roles
		});

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email.toString(),
				username: user.username.toString(),
				roles: user.roles
			}
		};
	}
}
