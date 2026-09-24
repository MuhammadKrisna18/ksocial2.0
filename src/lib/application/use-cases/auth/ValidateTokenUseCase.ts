import type { ITokenService, JwtPayload } from '$lib/application/interfaces/ITokenService';
import type { ITokenRevocationService } from '$lib/application/interfaces/ITokenRevocationService';
import { AuthenticationError } from '$lib/application/exceptions';

export class ValidateTokenUseCase {
	constructor(
		private readonly tokenService: ITokenService,
		private readonly tokenRevocationService?: ITokenRevocationService
	) {}

	execute(token: string): JwtPayload {
		if (this.tokenRevocationService?.isRevoked(token)) {
			throw new AuthenticationError('Token has been revoked');
		}

		try {
			return this.tokenService.verify(token);
		} catch {
			throw new AuthenticationError('Invalid or expired token');
		}
	}
}
