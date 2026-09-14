import { randomUUID } from 'crypto';
import { Email } from '$lib/domain/value-objects/Email';
import { Password } from '$lib/domain/value-objects/Password';
import { Username } from '$lib/domain/value-objects/Username';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IRoleRepository } from '$lib/domain/repositories/IRoleRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';
import type { RegisterDTO, AuthResponseDTO } from '$lib/application/dtos/auth.dto';
import { DEFAULT_USER_ROLE } from '$lib/infrastructure/config/constants';

export class RegisterUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly roleRepo: IRoleRepository,
		private readonly hashService: IHashService,
		private readonly tokenService: ITokenService
	) {}

	async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
		const email = Email.create(dto.email);
		const password = Password.createRaw(dto.password);
		const username = Username.create(dto.username);

		if (await this.userRepo.existsByEmail(email.toString())) {
			throw new Error('Email already in use');
		}

		if (await this.userRepo.existsByUsername(username.toString())) {
			throw new Error('Username already in use');
		}

		const defaultRole = await this.roleRepo.findByName(DEFAULT_USER_ROLE);
		if (!defaultRole) {
			throw new Error('Default role not found. Run the seeder first.');
		}

		const passwordHash = await this.hashService.hash(password.toString());

		const user = await this.userRepo.create({
			id: randomUUID(),
			fullName: dto.fullName,
			email: email.toString(),
			username: username.toString(),
			passwordHash,
			dateOfBirth: dto.dateOfBirth,
			roleIds: [defaultRole.id]
		});

		const accessToken = this.tokenService.sign({
			sub: user.id,
			email: user.email,
			username: user.username,
			roles: user.roles
		});

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				roles: user.roles
			}
		};
	}
}
