import { describe, it, expect } from 'vitest';
import { Username } from '$lib/domain/value-objects/Username';

describe('Username Value Object', () => {
	describe('Boundary Value Analysis (BVA) - Panjang Karakter [3, 32]', () => {
		// Batas Bawah: Min = 3
		it('BVA-U-01 (Min - 1): harus melempar error jika panjang 2 karakter', () => {
			expect(() => Username.create('ab')).toThrow('Username must be at least 3 characters long');
		});

		it('BVA-U-02 (Min): harus valid jika panjang tepat 3 karakter', () => {
			const username = Username.create('abc');
			expect(username.toString()).toBe('abc');
		});

		it('BVA-U-03 (Min + 1): harus valid jika panjang 4 karakter', () => {
			const username = Username.create('abcd');
			expect(username.toString()).toBe('abcd');
		});

		// Batas Atas: Max = 32
		it('BVA-U-04 (Max - 1): harus valid jika panjang 31 karakter', () => {
			const raw = 'a'.repeat(31);
			const username = Username.create(raw);
			expect(username.toString()).toBe(raw);
		});

		it('BVA-U-05 (Max): harus valid jika panjang tepat 32 karakter', () => {
			const raw = 'a'.repeat(32);
			const username = Username.create(raw);
			expect(username.toString()).toBe(raw);
		});

		it('BVA-U-06 (Max + 1): harus melempar error jika panjang 33 karakter', () => {
			const raw = 'a'.repeat(33);
			expect(() => Username.create(raw)).toThrow('Username must be at most 32 characters long');
		});
	});

	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi Valid', () => {
			it('EP-U-01: harus menerima alfanumerik biasa dan underscore', () => {
				const u1 = Username.create('krisna_18');
				const u2 = Username.create('User123');
				const u3 = Username.create('___');

				expect(u1.toString()).toBe('krisna_18');
				expect(u2.toString()).toBe('User123');
				expect(u3.toString()).toBe('___');
			});

			it('EP-U-02: harus membersihkan leading/trailing whitespace dengan trim', () => {
				const username = Username.create('  valid_user  ');
				expect(username.toString()).toBe('valid_user');
			});
		});

		describe('Partisi Invalid', () => {
			it('EP-U-03: harus menolak karakter spesial (@, #, $, -, .)', () => {
				expect(() => Username.create('user@123')).toThrow('Username may only contain letters, numbers, and underscores');
				expect(() => Username.create('user#name')).toThrow('Username may only contain letters, numbers, and underscores');
				expect(() => Username.create('user-name')).toThrow('Username may only contain letters, numbers, and underscores');
				expect(() => Username.create('user.name')).toThrow('Username may only contain letters, numbers, and underscores');
			});

			it('EP-U-04: harus menolak spasi di tengah username', () => {
				expect(() => Username.create('user name')).toThrow('Username may only contain letters, numbers, and underscores');
			});

			it('EP-U-05: harus menolak string kosong atau hanya berisi spasi', () => {
				expect(() => Username.create('')).toThrow('Username must be at least 3 characters long');
				expect(() => Username.create('   ')).toThrow('Username must be at least 3 characters long');
			});
		});
	});

	describe('Method Utility (equals & toString)', () => {
		it('harus membandingkan kesamaan dua instance Username', () => {
			const u1 = Username.create('krisna');
			const u2 = Username.create('krisna');
			const u3 = Username.create('other');

			expect(u1.equals(u2)).toBe(true);
			expect(u1.equals(u3)).toBe(false);
		});
	});
});
