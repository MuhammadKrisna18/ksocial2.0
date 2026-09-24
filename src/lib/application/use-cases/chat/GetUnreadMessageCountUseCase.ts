import type { IMessageRepository } from '$lib/domain/repositories/IMessageRepository';

export class GetUnreadMessageCountUseCase {
	constructor(private messageRepo: IMessageRepository) {}

	async execute(userId: string): Promise<number> {
		if (!userId) return 0;
		return await this.messageRepo.getUnreadCount(userId);
	}
}
