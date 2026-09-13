import bcrypt from 'bcryptjs';
import type { IHashService } from '$lib/application/interfaces/IHashService';
import { BCRYPT_SALT_ROUNDS } from '$lib/infrastructure/config/constants';

export class HashService implements IHashService {
	async hash(plain: string): Promise<string> {
		return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
	}

	async compare(plain: string, hash: string): Promise<boolean> {
		return bcrypt.compare(plain, hash);
	}
}
