import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TokenRevocationService } from '$lib/infrastructure/security/TokenRevocationService';
import { ValidateTokenUseCase } from '$lib/application/use-cases/auth/ValidateTokenUseCase';
import { AuthenticationError } from '$lib/application/exceptions';
import type { ITokenService, JwtPayload } from '$lib/application/interfaces/ITokenService';

describe('TokenRevocationService', () => {
	let mockTokenService: ITokenService;
	let revocationService: TokenRevocationService;

	beforeEach(() => {
		vi.useFakeTimers();
		mockTokenService = {
			sign: vi.fn(),
			verify: vi.fn(),
			decode: vi.fn().mockImplementation((token: string) => {
				if (token === 'valid_token') {
					return {
						sub: 'user1',
						email: 'user@example.com',
						username: 'user1',
						roles: ['user'],
						exp: Math.floor((Date.now() + 3600_000) / 1000)
					};
				}
				return null;
			})
		};
		revocationService = new TokenRevocationService(mockTokenService, 60_000);
	});

	afterEach(() => {
		revocationService.destroy();
		vi.useRealTimers();
	});

	it('should return false for unrevoked tokens', () => {
		expect(revocationService.isRevoked('valid_token')).toBe(false);
	});

	it('should return true immediately after token is revoked', () => {
		revocationService.revoke('valid_token');
		expect(revocationService.isRevoked('valid_token')).toBe(true);
	});

	it('should return true for empty or null tokens', () => {
		expect(revocationService.isRevoked('')).toBe(true);
	});

	it('should automatically remove expired revoked tokens from memory', () => {
		revocationService.revoke('valid_token');
		expect(revocationService.isRevoked('valid_token')).toBe(true);

		// Advance time past the 1 hour token expiration
		vi.advanceTimersByTime(3601_000);

		// Once naturally expired, isRevoked returns false so normal JWT expiry takes over
		expect(revocationService.isRevoked('valid_token')).toBe(false);
	});
});

describe('ValidateTokenUseCase with TokenRevocationService', () => {
	let mockTokenService: ITokenService;
	let revocationService: TokenRevocationService;
	let validateUseCase: ValidateTokenUseCase;

	const dummyPayload: JwtPayload = {
		sub: 'user1',
		email: 'test@example.com',
		username: 'testuser',
		roles: ['user']
	};

	beforeEach(() => {
		mockTokenService = {
			sign: vi.fn(),
			verify: vi.fn().mockReturnValue(dummyPayload),
			decode: vi.fn().mockReturnValue({
				...dummyPayload,
				exp: Math.floor((Date.now() + 3600_000) / 1000)
			})
		};
		revocationService = new TokenRevocationService(mockTokenService);
		validateUseCase = new ValidateTokenUseCase(mockTokenService, revocationService);
	});

	afterEach(() => {
		revocationService.destroy();
	});

	it('should successfully validate a token when not revoked', () => {
		const payload = validateUseCase.execute('token_abc');
		expect(payload).toEqual(dummyPayload);
		expect(mockTokenService.verify).toHaveBeenCalledWith('token_abc');
	});

	it('should throw AuthenticationError when token has been revoked', () => {
		revocationService.revoke('token_abc');

		expect(() => validateUseCase.execute('token_abc')).toThrowError(AuthenticationError);
		expect(() => validateUseCase.execute('token_abc')).toThrowError('Token has been revoked');
		// verify should not even be called if token is already known revoked
		expect(mockTokenService.verify).not.toHaveBeenCalled();
	});

	it('should throw AuthenticationError when tokenService.verify fails', () => {
		vi.mocked(mockTokenService.verify).mockImplementation(() => {
			throw new Error('JWT expired');
		});

		expect(() => validateUseCase.execute('invalid_token')).toThrowError(AuthenticationError);
		expect(() => validateUseCase.execute('invalid_token')).toThrowError('Invalid or expired token');
	});
});
