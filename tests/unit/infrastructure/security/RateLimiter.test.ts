import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter, getClientIp } from '$lib/infrastructure/security/RateLimiter';

describe('RateLimiter', () => {
	let limiter: RateLimiter;

	beforeEach(() => {
		vi.useFakeTimers();
		limiter = new RateLimiter({
			windowMs: 60_000,
			maxRequests: 3
		});
	});

	afterEach(() => {
		limiter.destroy();
		vi.useRealTimers();
	});

	it('should allow requests under the limit', () => {
		const res1 = limiter.consume('client1');
		expect(res1.allowed).toBe(true);
		expect(res1.remaining).toBe(2);

		const res2 = limiter.consume('client1');
		expect(res2.allowed).toBe(true);
		expect(res2.remaining).toBe(1);

		const res3 = limiter.consume('client1');
		expect(res3.allowed).toBe(true);
		expect(res3.remaining).toBe(0);
	});

	it('should block requests exceeding the limit', () => {
		limiter.consume('client1');
		limiter.consume('client1');
		limiter.consume('client1');

		const blocked = limiter.consume('client1');
		expect(blocked.allowed).toBe(false);
		expect(blocked.remaining).toBe(0);
		expect(blocked.resetInSeconds).toBeGreaterThan(0);
	});

	it('should reset quota after the time window expires', () => {
		limiter.consume('client1');
		limiter.consume('client1');
		limiter.consume('client1');

		expect(limiter.consume('client1').allowed).toBe(false);

		// Advance time past the 60s window
		vi.advanceTimersByTime(61_000);

		const resAfterWindow = limiter.consume('client1');
		expect(resAfterWindow.allowed).toBe(true);
		expect(resAfterWindow.remaining).toBe(2);
	});

	it('should check without consuming quota', () => {
		const check1 = limiter.check('client1');
		expect(check1.allowed).toBe(true);
		expect(check1.remaining).toBe(3);

		// Check again - should still be 3
		const check2 = limiter.check('client1');
		expect(check2.remaining).toBe(3);

		// Now consume
		limiter.consume('client1');
		const check3 = limiter.check('client1');
		expect(check3.remaining).toBe(2);
	});

	it('should reset limits when reset() is called', () => {
		limiter.consume('client1');
		limiter.consume('client1');
		limiter.consume('client1');
		expect(limiter.check('client1').allowed).toBe(false);

		limiter.reset('client1');
		expect(limiter.check('client1').allowed).toBe(true);
		expect(limiter.check('client1').remaining).toBe(3);
	});

	it('should isolate limits between different keys', () => {
		limiter.consume('client1');
		limiter.consume('client1');
		limiter.consume('client1');

		expect(limiter.check('client1').allowed).toBe(false);
		expect(limiter.check('client2').allowed).toBe(true);
		expect(limiter.check('client2').remaining).toBe(3);
	});

	it('should generate valid rate limit headers', () => {
		const res = limiter.consume('client1');
		const headers = limiter.getHeaders(res);

		expect(headers['X-RateLimit-Limit']).toBe('3');
		expect(headers['X-RateLimit-Remaining']).toBe('2');
		expect(headers['Retry-After']).toBeUndefined();

		limiter.consume('client1');
		const blockedRes = limiter.consume('client1'); // remaining 0
		const overLimitRes = limiter.consume('client1'); // blocked
		const blockedHeaders = limiter.getHeaders(overLimitRes);

		expect(blockedHeaders['Retry-After']).toBeDefined();
	});
});

describe('getClientIp', () => {
	it('should extract IP from getClientAddress if available', () => {
		const event = {
			getClientAddress: () => '192.168.1.50'
		};
		expect(getClientIp(event)).toBe('192.168.1.50');
	});

	it('should fallback to x-forwarded-for header', () => {
		const event = {
			request: new Request('http://localhost', {
				headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }
			})
		};
		expect(getClientIp(event)).toBe('203.0.113.195');
	});

	it('should fallback to x-real-ip header', () => {
		const event = {
			request: new Request('http://localhost', {
				headers: { 'x-real-ip': '198.51.100.22' }
			})
		};
		expect(getClientIp(event)).toBe('198.51.100.22');
	});

	it('should return 127.0.0.1 as default fallback', () => {
		const event = {};
		expect(getClientIp(event)).toBe('127.0.0.1');
	});
});
