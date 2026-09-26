import { FirebaseStorageService, firebaseUserStorage, firebasePostStorage } from './FirebaseStorage';

export class LocalFileStorage extends FirebaseStorageService {
	constructor(folder: string = 'users') {
		super(folder);
	}
}

export const localFileStorage = firebaseUserStorage;
export const postFileStorage = firebasePostStorage;

