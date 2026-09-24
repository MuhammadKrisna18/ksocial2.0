export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetInSeconds: number;
	limit: number;
}

export interface RateLimiterOptions {
	windowMs: number;
	maxRequests: number;
	cleanupIntervalMs?: number;
}

export class RateLimiter {
	private readonly windowMs: number;
	private readonly maxRequests: number;
	private readonly store = new Map<string, number[]>();
	private cleanupTimer?: ReturnType<typeof setInterval>;

	constructor(options: RateLimiterOptions) {
		this.windowMs = options.windowMs;
		this.maxRequests = options.maxRequests;

		const intervalMs = options.cleanupIntervalMs ?? 60_000;
		if (typeof setInterval !== 'undefined') {
			this.cleanupTimer = setInterval(() => this.cleanup(), intervalMs);
			if (this.cleanupTimer && typeof this.cleanupTimer.unref === 'function') {
				this.cleanupTimer.unref();
			}
		}
	}

	/**
	 * Checks if the key has exceeded the limit without consuming quota.
	 */
	check(key: string): RateLimitResult {
		const now = Date.now();
		const timestamps = this.getValidTimestamps(key, now);

		const remaining = Math.max(0, this.maxRequests - timestamps.length);
		const allowed = timestamps.length < this.maxRequests;
		const oldestTimestamp = timestamps[0] ?? now;
		const resetInSeconds = allowed
			? Math.ceil(this.windowMs / 1000)
			: Math.max(1, Math.ceil((oldestTimestamp + this.windowMs - now) / 1000));

		return {
			allowed,
			remaining,
			resetInSeconds,
			limit: this.maxRequests
		};
	}

	/**
	 * Consumes 1 quota for the key and returns the rate limit status.
	 */
	consume(key: string): RateLimitResult {
		const now = Date.now();
		const timestamps = this.getValidTimestamps(key, now);

		if (timestamps.length >= this.maxRequests) {
			const oldestTimestamp = timestamps[0] ?? now;
			const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + this.windowMs - now) / 1000));
			return {
				allowed: false,
				remaining: 0,
				resetInSeconds,
				limit: this.maxRequests
			};
		}

		timestamps.push(now);
		this.store.set(key, timestamps);

		return {
			allowed: true,
			remaining: Math.max(0, this.maxRequests - timestamps.length),
			resetInSeconds: Math.ceil(this.windowMs / 1000),
			limit: this.maxRequests
		};
	}

	/**
	 * Resets rate limit for a specific key (e.g. after successful login).
	 */
	reset(key: string): void {
		this.store.delete(key);
	}

	/**
	 * Destroys cleanup interval for testing or shutdown.
	 */
	destroy(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = undefined;
		}
		this.store.clear();
	}

	/**
	 * Returns HTTP rate-limit headers for response.
	 */
	getHeaders(result: RateLimitResult): Record<string, string> {
		const headers: Record<string, string> = {
			'X-RateLimit-Limit': result.limit.toString(),
			'X-RateLimit-Remaining': result.remaining.toString(),
			'X-RateLimit-Reset': result.resetInSeconds.toString()
		};

		if (!result.allowed) {
			headers['Retry-After'] = result.resetInSeconds.toString();
		}

		return headers;
	}

	private getValidTimestamps(key: string, now: number): number[] {
		const cutoff = now - this.windowMs;
		const raw = this.store.get(key);
		if (!raw || raw.length === 0) {
			return [];
		}

		const valid = raw.filter((t) => t > cutoff);
		if (valid.length === 0) {
			this.store.delete(key);
			return [];
		}

		if (valid.length !== raw.length) {
			this.store.set(key, valid);
		}

		return valid;
	}

	private cleanup(): void {
		const now = Date.now();
		const cutoff = now - this.windowMs;

		for (const [key, timestamps] of this.store.entries()) {
			const valid = timestamps.filter((t) => t > cutoff);
			if (valid.length === 0) {
				this.store.delete(key);
			} else if (valid.length !== timestamps.length) {
				this.store.set(key, valid);
			}
		}
	}
}

/**
 * Extracts client IP from SvelteKit event or Request headers.
 */
export function getClientIp(event: {
	getClientAddress?: () => string;
	request?: Request;
}): string {
	if (typeof event.getClientAddress === 'function') {
		try {
			const addr = event.getClientAddress();
			if (addr) return addr;
		} catch {
			// getClientAddress can throw in non-standard adapters or tests
		}
	}

	const req = event.request;
	if (req?.headers) {
		const forwarded = req.headers.get('x-forwarded-for');
		if (forwarded) {
			const firstIp = forwarded.split(',')[0].trim();
			if (firstIp) return firstIp;
		}

		const realIp = req.headers.get('x-real-ip');
		if (realIp && realIp.trim()) {
			return realIp.trim();
		}

		const cfConnectingIp = req.headers.get('cf-connecting-ip');
		if (cfConnectingIp && cfConnectingIp.trim()) {
			return cfConnectingIp.trim();
		}
	}

	return '127.0.0.1';
}

// 5 failed login attempts per 5 minutes per IP
export const loginRateLimiter = new RateLimiter({
	windowMs: 5 * 60 * 1000,
	maxRequests: 5
});

// 3 registration attempts per 10 minutes per IP
export const registerRateLimiter = new RateLimiter({
	windowMs: 10 * 60 * 1000,
	maxRequests: 3
});

// 30 chat messages per minute per user
export const chatRateLimiter = new RateLimiter({
	windowMs: 60 * 1000,
	maxRequests: 30
});

// 10 posts per 5 minutes per user
export const postRateLimiter = new RateLimiter({
	windowMs: 5 * 60 * 1000,
	maxRequests: 10
});

// 120 API requests per minute per IP for general DoS protection
export const apiRateLimiter = new RateLimiter({
	windowMs: 60 * 1000,
	maxRequests: 120
});
