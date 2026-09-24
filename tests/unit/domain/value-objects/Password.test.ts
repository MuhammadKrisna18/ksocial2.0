import { describe, it, expect } from 'vitest';
import { Password } from '$lib/domain/value-objects/Password';

describe('Password Value Object', () => {
	describe('Equivalence Partitioning (EP)', () => {
		it('EP-P-01: Partisi Raw Password (isHashed = false)', () => {
			const password = Password.createRaw('MySecret123!');
			expect(password.toString()).toBe('MySecret123!');
			expect(password.isHashed).toBe(false);
		});

		it('EP-P-02: Partisi Hashed Password (isHashed = true)', () => {
			const hash = '$2a$10$abcdefghijklmnopqrstuvwxyz123456';
			const password = Password.fromHash(hash);
			expect(password.toString()).toBe(hash);
			expect(password.isHashed).toBe(true);
		});
	});
});
