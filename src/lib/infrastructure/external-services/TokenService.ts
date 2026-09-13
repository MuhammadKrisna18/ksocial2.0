import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ITokenService, JwtPayload } from '$lib/application/interfaces/ITokenService';
import { serverEnv } from '$lib/infrastructure/config/env';

export class TokenService implements ITokenService {
	private get signOptions(): SignOptions {
		return { expiresIn: serverEnv.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
	}

	sign(payload: JwtPayload): string {
		return jwt.sign(payload, serverEnv.JWT_SECRET, this.signOptions);
	}

	verify(token: string): JwtPayload {
		const decoded = jwt.verify(token, serverEnv.JWT_SECRET);

		if (typeof decoded === 'string') {
			throw new Error('Invalid token payload');
		}

		return decoded as JwtPayload;
	}

	decode(token: string): JwtPayload | null {
		const decoded = jwt.decode(token);

		if (!decoded || typeof decoded === 'string') {
			return null;
		}

		return decoded as JwtPayload;
	}
}
