import type { IMessageRepository, ChatContact } from '../../../domain/repositories/IMessageRepository';

export class GetChatContactsUseCase {
	constructor(private messageRepo: IMessageRepository) {}

	async execute(userId: string): Promise<ChatContact[]> {
		return await this.messageRepo.getContacts(userId);
	}
}
