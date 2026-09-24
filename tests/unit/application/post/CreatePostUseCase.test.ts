import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePostUseCase } from '$lib/application/use-cases/post/CreatePostUseCase';
import { Post } from '$lib/domain/entities/Post';
import { ValidationError } from '$lib/application/exceptions';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';

describe('CreatePostUseCase', () => {
	let useCase: CreatePostUseCase;
	let mockPostRepository: Partial<IPostRepository>;

	beforeEach(() => {
		mockPostRepository = {
			create: vi.fn(async (params) =>
				Post.create({
					id: params.id,
					authorId: params.userId,
					content: params.content,
					media: params.media
				})
			)
		};
		useCase = new CreatePostUseCase(mockPostRepository as IPostRepository);
	});

	describe('Boundary Value Analysis (BVA) - Panjang Karakter Konten', () => {
		it('BVA-P-01: panjang 0 karakter (string kosong) harus melempar ValidationError', async () => {
			await expect(
				useCase.execute({
					userId: 'user-1',
					content: ''
				})
			).rejects.toThrow(ValidationError);
			expect(mockPostRepository.create).not.toHaveBeenCalled();
		});

		it('BVA-P-02: 1 karakter whitespace (" ") harus melempar ValidationError', async () => {
			await expect(
				useCase.execute({
					userId: 'user-1',
					content: ' '
				})
			).rejects.toThrow('Content cannot be empty');
			expect(mockPostRepository.create).not.toHaveBeenCalled();
		});

		it('BVA-P-03: batas minimum valid 1 karakter ("a") harus berhasil membuat post', async () => {
			const result = await useCase.execute({
				userId: 'user-1',
				content: 'a'
			});

			expect(result).toBeDefined();
			expect(result.content).toBe('a');
			expect(mockPostRepository.create).toHaveBeenCalledTimes(1);
		});

		it('BVA-P-04: 2 karakter ("ab") harus berhasil membuat post', async () => {
			const result = await useCase.execute({
				userId: 'user-1',
				content: 'ab'
			});

			expect(result.content).toBe('ab');
			expect(mockPostRepository.create).toHaveBeenCalledTimes(1);
		});
	});

	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi Valid', () => {
			it('EP-P-01: konten teks biasa harus berhasil disimpan', async () => {
				const result = await useCase.execute({
					userId: 'user-123',
					content: 'Halo teman-teman di K-Social!'
				});

				expect(result.authorId).toBe('user-123');
				expect(result.content).toBe('Halo teman-teman di K-Social!');
			});

			it('EP-P-02: konten dengan spasi di awal/akhir harus di-trim saat disimpan', async () => {
				const result = await useCase.execute({
					userId: 'user-123',
					content: '   pesan penting dengan padding spasi   '
				});

				expect(result.content).toBe('pesan penting dengan padding spasi');
			});

			it('EP-P-03: konten valid disertai array media harus disimpan lengkap', async () => {
				const media = [
					{ url: 'https://example.com/photo.png', type: 'image' as const },
					{ url: 'https://example.com/video.mp4', type: 'video' as const }
				];

				const result = await useCase.execute({
					userId: 'user-123',
					content: 'Postingan dengan media gambar dan video',
					media
				});

				expect(result.media).toEqual(media);
			});
		});

		describe('Partisi Invalid', () => {
			it('EP-P-04: multi-line whitespace (tabs, newlines) harus ditolak', async () => {
				await expect(
					useCase.execute({
						userId: 'user-1',
						content: '\n\t  \r\n   '
					})
				).rejects.toThrow(ValidationError);
			});

			it('EP-P-05: content bernilai undefined/falsy harus ditolak', async () => {
				await expect(
					useCase.execute({
						userId: 'user-1',
						content: undefined as unknown as string
					})
				).rejects.toThrow(ValidationError);
			});
		});
	});
});
