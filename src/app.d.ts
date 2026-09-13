import type { JwtPayload } from '$lib/application/interfaces/ITokenService';

declare global {
	namespace App {
		interface Locals {
			user: JwtPayload | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
