export interface ITokenRevocationService {
	revoke(token: string): void;
	isRevoked(token: string): boolean;
}
