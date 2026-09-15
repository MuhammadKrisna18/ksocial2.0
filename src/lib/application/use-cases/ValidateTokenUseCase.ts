import type { TokenService, JwtPayload } from '$lib/infrastructure/external-services/TokenService';
import { AuthenticationError } from '$lib/application/exceptions';

export class ValidateTokenUseCase {
	constructor(private readonly tokenService: TokenService) {}

	execute(token: string): JwtPayload {
		try {
			return this.tokenService.verify(token);
		} catch (cause) {
			throw new AuthenticationError('Invalid or expired token');
		}
	}
}
