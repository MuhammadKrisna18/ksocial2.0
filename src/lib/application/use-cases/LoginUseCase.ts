import { Email } from '$lib/domain/value-objects/Email';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';
import type { LoginDTO, AuthResponseDTO } from '$lib/application/dtos/auth.dto';

export class LoginUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly hashService: IHashService,
		private readonly tokenService: ITokenService
	) {}

	async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
		const email = Email.create(dto.email);

		const user = await this.userRepo.findByEmail(email.toString());
		if (!user) {
			throw new Error('Invalid credentials');
		}

		const isValid = await this.hashService.compare(dto.password, user.passwordHash);
		if (!isValid) {
			throw new Error('Invalid credentials');
		}

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
