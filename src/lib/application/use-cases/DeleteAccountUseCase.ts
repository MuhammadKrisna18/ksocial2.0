import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';

export class DeleteAccountUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(userId: string): Promise<void> {
		const user = await this.userRepository.findById(userId);
		
		if (!user) {
			throw new Error('User not found');
		}

		await this.userRepository.delete(userId);
	}
}
