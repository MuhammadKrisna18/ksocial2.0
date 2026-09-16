import { Email } from '$lib/domain/value-objects/Email';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { HashService } from '$lib/infrastructure/external-services/HashService';
import type { TokenService } from '$lib/infrastructure/external-services/TokenService';
import { AuthenticationError } from '$lib/application/exceptions';
import type { LoginDTO, AuthResponseDTO } from '$lib/application/dtos/auth.dto';

export class LoginUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly hashService: HashService,
		private readonly tokenService: TokenService
	) {}

	async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
		const email = Email.create(dto.email);

		const user = await this.userRepo.findByEmail(email.toString());
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
