import type { ITokenService, JwtPayload } from '$lib/application/interfaces/ITokenService';
import { AuthenticationError } from '$lib/application/exceptions';

export class ValidateTokenUseCase {
	constructor(private readonly tokenService: ITokenService) {}

	execute(token: string): JwtPayload {
		try {
			return this.tokenService.verify(token);
		} catch (cause) {
			throw new AuthenticationError('Invalid or expired token');
		}
	}
}
