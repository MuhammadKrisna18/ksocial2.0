import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DismissNotificationUseCase } from '$lib/application/use-cases/notification/DismissNotificationUseCase';
import { Notification } from '$lib/domain/entities/Notification';
import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';

describe('DismissNotificationUseCase', () => {
	let useCase: DismissNotificationUseCase;
	let mockNotificationRepo: Partial<INotificationRepository>;

	beforeEach(() => {
		mockNotificationRepo = {
			findById: vi.fn(),
			delete: vi.fn().mockResolvedValue(undefined)
		};
		useCase = new DismissNotificationUseCase(mockNotificationRepo as INotificationRepository);
	});

	describe('Equivalence Partitioning (EP)', () => {
		describe('Partisi 1: Validasi Parameter Input', () => {
			it('EP-N-01: harus melempar ValidationError jika notificationId kosong', async () => {
				await expect(useCase.execute('', 'user-123')).rejects.toThrow(
					'Notification ID and User ID are required'
				);
				expect(mockNotificationRepo.findById).not.toHaveBeenCalled();
				expect(mockNotificationRepo.delete).not.toHaveBeenCalled();
			});

			it('EP-N-02: harus melempar ValidationError jika userId kosong', async () => {
				await expect(useCase.execute('notif-123', '')).rejects.toThrow(
					'Notification ID and User ID are required'
				);
				expect(mockNotificationRepo.findById).not.toHaveBeenCalled();
				expect(mockNotificationRepo.delete).not.toHaveBeenCalled();
			});

			it('EP-N-03: harus melempar ValidationError jika kedua parameter kosong', async () => {
				await expect(useCase.execute('', '')).rejects.toThrow(
					'Notification ID and User ID are required'
				);
			});
		});

		describe('Partisi 2: Notifikasi Tidak Ditemukan / Sudah Terhapus', () => {
			it('EP-N-04: harus selesai secara halus (graceful return) jika notifikasi tidak ditemukan', async () => {
				vi.mocked(mockNotificationRepo.findById!).mockResolvedValue(null);

				await expect(useCase.execute('notif-nonexistent', 'user-123')).resolves.toBeUndefined();
				expect(mockNotificationRepo.findById).toHaveBeenCalledWith('notif-nonexistent');
				expect(mockNotificationRepo.delete).not.toHaveBeenCalled();
			});
		});

		describe('Partisi 3: Otorisasi Pengguna (Unauthorized)', () => {
			it('EP-N-05: harus melempar ValidationError jika userId bukan pemilik notifikasi', async () => {
				const existingNotif = new Notification({
					id: 'notif-1',
					userId: 'user-owner',
					senderId: 'user-sender',
					type: 'like',
					read: false,
					createdAt: new Date()
				});

				vi.mocked(mockNotificationRepo.findById!).mockResolvedValue(existingNotif);

				await expect(useCase.execute('notif-1', 'user-impostor')).rejects.toThrow(
					'Unauthorized to dismiss this notification'
				);
				expect(mockNotificationRepo.delete).not.toHaveBeenCalled();
			});
		});

		describe('Partisi 4: Berhasil Menghapus (Authorized Owner)', () => {
			it('EP-N-06: harus memanggil delete jika userId cocok dengan pemilik notifikasi', async () => {
				const existingNotif = new Notification({
					id: 'notif-1',
					userId: 'user-owner',
					senderId: 'user-sender',
					type: 'like',
					read: false,
					createdAt: new Date()
				});

				vi.mocked(mockNotificationRepo.findById!).mockResolvedValue(existingNotif);

				await useCase.execute('notif-1', 'user-owner');

				expect(mockNotificationRepo.findById).toHaveBeenCalledWith('notif-1');
				expect(mockNotificationRepo.delete).toHaveBeenCalledWith('notif-1');
				expect(mockNotificationRepo.delete).toHaveBeenCalledTimes(1);
			});
		});
	});
});
