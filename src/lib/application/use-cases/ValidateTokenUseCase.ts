import type { ITokenService, JwtPayload } from '$lib/application/interfaces/ITokenService';

export class ValidateTokenUseCase {
	constructor(private readonly tokenService: ITokenService) {}

	execute(token: string): JwtPayload {
		try {
			return this.tokenService.verify(token);
		} catch (cause) {
			throw new Error('Invalid or expired token', { cause });
		}
	}
}
