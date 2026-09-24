import { describe, it, expect } from 'vitest';
import { isOwnPost } from '$lib/features/post/utils';

describe('isOwnPost Utility', () => {
	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi 1: currentUser tidak terautentikasi (null / undefined)', () => {
			it('EP-OP-01: harus return false jika currentUser adalah undefined', () => {
				const result = isOwnPost({
					authorId: 'user-123',
					authorUsername: 'krisna',
					currentUser: undefined
				});
				expect(result).toBe(false);
			});

			it('EP-OP-02: harus return false jika currentUser adalah null', () => {
				const result = isOwnPost({
					authorId: 'user-123',
					authorUsername: 'krisna',
					currentUser: null
				});
				expect(result).toBe(false);
			});
		});

		describe('Partisi 2: currentUser adalah pembuat postingan (Own Post / Me)', () => {
			it('EP-OP-03: harus return true jika currentUser.sub cocok dengan authorId', () => {
				const result = isOwnPost({
					authorId: 'user-123',
					authorUsername: 'krisna',
					currentUser: { sub: 'user-123', username: 'krisna' }
				});
				expect(result).toBe(true);
			});

			it('EP-OP-04: harus return true jika currentUser.id cocok dengan authorId', () => {
				const result = isOwnPost({
					authorId: 'user-456',
					authorUsername: 'krisna',
					currentUser: { id: 'user-456', username: 'krisna' }
				});
				expect(result).toBe(true);
			});

			it('EP-OP-05: harus return true jika currentUser.username cocok dengan authorUsername', () => {
				const result = isOwnPost({
					authorId: 'other-id',
					authorUsername: 'krisna18',
					currentUser: { sub: 'other-id', username: 'krisna18' }
				});
				expect(result).toBe(true);
			});
		});

		describe('Partisi 3: Postingan milik orang lain (Other User)', () => {
			it('EP-OP-06: harus return false jika authorId dan username berbeda', () => {
				const result = isOwnPost({
					authorId: 'author-999',
					authorUsername: 'budi',
					currentUser: { sub: 'user-123', username: 'krisna' }
				});
				expect(result).toBe(false);
			});
		});
	});
});
