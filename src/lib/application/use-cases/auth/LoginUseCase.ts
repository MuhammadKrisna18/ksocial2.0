import { Email } from '$lib/domain/value-objects/Email';
import type { User } from '$lib/domain/entities/User';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';
import { AuthenticationError } from '$lib/application/exceptions';
import type { LoginDTO, AuthResponseDTO } from '$lib/application/dtos/auth.dto';

export class LoginUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly hashService: IHashService,
		private readonly tokenService: ITokenService
	) {}

	async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
		const identifier = dto.email.trim();
		let user: User | null = null;

		if (identifier.includes('@')) {
			try {
				const email = Email.create(identifier);
				user = await this.userRepo.findByEmail(email.toString());
			} catch {
				throw new AuthenticationError('Invalid credentials');
			}
		} else {
			user = await this.userRepo.findByUsername(identifier);
		}

		if (!user) {
			throw new AuthenticationError('Invalid credentials');
		}

		const isValid = await this.hashService.compare(dto.password, user.passwordHash);
		if (!isValid) {
			throw new AuthenticationError('Invalid credentials');
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
