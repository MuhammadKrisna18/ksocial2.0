import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseConfig } from '$lib/infrastructure/external-services/firebaseClient';

export class FirebaseStorageService {
	private readonly folder: string;

	constructor(folder: string = 'uploads') {
		this.folder = folder;
	}

	async saveFile(file: File, filename: string): Promise<string> {
		const arrayBuffer = await file.arrayBuffer();
		const mimeType = file.type || 'image/jpeg';

		try {
			const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
			const storage = getStorage(app);
			const fullPath = `${this.folder}/${filename}`;
			const storageRef = ref(storage, fullPath);

			const bytes = new Uint8Array(arrayBuffer);
			await uploadBytes(storageRef, bytes, {
				contentType: mimeType
			});

			const downloadUrl = await getDownloadURL(storageRef);
			return downloadUrl;
		} catch (error: any) {
			console.warn(
				`[Firebase Storage] Upload failed (${error?.code || error?.message || 'unknown'}). Falling back to Data URL:`,
				error
			);

			// Safe fallback: Encode as Data URL (base64) so uploads never crash on Vercel
			const base64 = Buffer.from(arrayBuffer).toString('base64');
			return `data:${mimeType};base64,${base64}`;
		}
	}

	async deleteFileByUrl(url: string): Promise<void> {
		if (!url || !url.startsWith('https://firebasestorage.googleapis.com')) {
			return;
		}

		try {
			const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
			const storage = getStorage(app);
			const storageRef = ref(storage, url);
			await deleteObject(storageRef);
		} catch (err) {
			console.warn('[Firebase Storage] Could not delete file:', err);
		}
	}
}

export const firebaseUserStorage = new FirebaseStorageService('users');
export const firebasePostStorage = new FirebaseStorageService('posts');
