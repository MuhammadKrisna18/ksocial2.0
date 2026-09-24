import { describe, it, expect } from 'vitest';
import { Email } from '$lib/domain/value-objects/Email';

describe('Email Value Object', () => {
	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi Valid', () => {
			it('EP-E-01: harus menerima email dengan format standar', () => {
				const email = Email.create('user@example.com');
				expect(email.toString()).toBe('user@example.com');
			});

			it('EP-E-02: harus menerima subdomain dan domain ganda', () => {
				const email1 = Email.create('user@mail.sub.example.com');
				const email2 = Email.create('user@univ.ac.id');
				expect(email1.toString()).toBe('user@mail.sub.example.com');
				expect(email2.toString()).toBe('user@univ.ac.id');
			});

			it('EP-E-03: harus menormalkan huruf besar ke huruf kecil (lowercase) dan trim', () => {
				const email = Email.create('  USER.Name+tag@EXAMPLE.COM  ');
				expect(email.toString()).toBe('user.name+tag@example.com');
			});
		});

		describe('Partisi Invalid', () => {
			it('EP-E-04: harus menolak email tanpa simbol @', () => {
				expect(() => Email.create('userexample.com')).toThrow(/Invalid email address/);
			});

			it('EP-E-05: harus menolak email tanpa bagian nama domain / ekstensi', () => {
				expect(() => Email.create('user@')).toThrow(/Invalid email address/);
				expect(() => Email.create('user@com')).toThrow(/Invalid email address/);
			});

			it('EP-E-06: harus menolak email tanpa username sebelum @', () => {
				expect(() => Email.create('@example.com')).toThrow(/Invalid email address/);
			});

			it('EP-E-07: harus menolak email dengan lebih dari satu simbol @', () => {
				expect(() => Email.create('user@@example.com')).toThrow(/Invalid email address/);
				expect(() => Email.create('user@other@example.com')).toThrow(/Invalid email address/);
			});

			it('EP-E-08: harus menolak spasi di tengah email', () => {
				expect(() => Email.create('user @example.com')).toThrow(/Invalid email address/);
				expect(() => Email.create('user@ example.com')).toThrow(/Invalid email address/);
				expect(() => Email.create('user@example .com')).toThrow(/Invalid email address/);
			});

			it('EP-E-09: harus menolak string kosong atau whitespace saja', () => {
				expect(() => Email.create('')).toThrow(/Invalid email address/);
				expect(() => Email.create('   ')).toThrow(/Invalid email address/);
			});
		});
	});

	describe('Boundary Value Analysis (BVA) - Struktur Batas Minimal', () => {
		it('BVA-E-01: batas minimal token (1 char sebelum @, 1 char domain, 1 char TLD)', () => {
			const email = Email.create('a@b.c');
			expect(email.toString()).toBe('a@b.c');
		});

		it('BVA-E-02: 0 karakter sebelum @ (Min - 1 bagian lokal)', () => {
			expect(() => Email.create('@b.c')).toThrow(/Invalid email address/);
		});

		it('BVA-E-03: 0 karakter antara @ dan . (Min - 1 bagian domain)', () => {
			expect(() => Email.create('a@.c')).toThrow(/Invalid email address/);
		});

		it('BVA-E-04: 0 karakter setelah . (Min - 1 bagian TLD)', () => {
			expect(() => Email.create('a@b.')).toThrow(/Invalid email address/);
		});
	});

	describe('Method Utility (equals & isValid)', () => {
		it('harus memverifikasi kesamaan dua email yang identik atau berbeda kapitalisasi', () => {
			const e1 = Email.create('test@domain.com');
			const e2 = Email.create('TEST@domain.com');
			const e3 = Email.create('different@domain.com');

			expect(e1.equals(e2)).toBe(true);
			expect(e1.equals(e3)).toBe(false);
		});

		it('Email.isValid harus mengembalikan boolean yang benar', () => {
			expect(Email.isValid('valid@domain.com')).toBe(true);
			expect(Email.isValid('invalid-email')).toBe(false);
		});
	});
});
