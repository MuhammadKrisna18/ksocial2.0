import type { JwtPayload } from '$lib/application/interfaces/ITokenService';

declare global {
	namespace App {
		interface Locals {
			user: JwtPayload | null;
		}

	}
}

export {};
