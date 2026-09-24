import type { ITokenRevocationService } from '$lib/application/interfaces/ITokenRevocationService';
import type { ITokenService } from '$lib/application/interfaces/ITokenService';

export class TokenRevocationService implements ITokenRevocationService {
	private readonly revokedTokens = new Map<string, number>();
	private cleanupTimer?: ReturnType<typeof setInterval>;

	constructor(
		private readonly tokenService: ITokenService,
		cleanupIntervalMs: number = 5 * 60 * 1000
	) {
		if (typeof setInterval !== 'undefined') {
			this.cleanupTimer = setInterval(() => this.cleanup(), cleanupIntervalMs);
			if (this.cleanupTimer && typeof this.cleanupTimer.unref === 'function') {
				this.cleanupTimer.unref();
			}
		}
	}

	revoke(token: string): void {
		if (!token) return;
		try {
			const decoded = this.tokenService.decode(token);
			const expiryMs = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
			this.revokedTokens.set(token, expiryMs);
		} catch {
			this.revokedTokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
		}
	}

	isRevoked(token: string): boolean {
		if (!token) return true;
		const expiry = this.revokedTokens.get(token);
		if (!expiry) return false;

		if (Date.now() > expiry) {
			this.revokedTokens.delete(token);
			return false;
		}

		return true;
	}

	destroy(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = undefined;
		}
		this.revokedTokens.clear();
	}

	private cleanup(): void {
		const now = Date.now();
		for (const [token, expiry] of this.revokedTokens.entries()) {
			if (now > expiry) {
				this.revokedTokens.delete(token);
			}
		}
	}
}
