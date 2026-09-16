import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';

export interface AcceptFollowDTO {
	followerId: string;
	followingId: string; // The user who is accepting the follow request
	notificationId?: string;
}

export class AcceptFollowUseCase {
	constructor(
		private followRepo: IFollowRepository
	) {}

	async execute(dto: AcceptFollowDTO): Promise<void> {
		const existingFollow = await this.followRepo.findByUsers(dto.followerId, dto.followingId);
		if (!existingFollow || existingFollow.status !== 'pending') {
			throw new Error('No pending follow request found');
		}

		const event = existingFollow.accept();
		
		await this.followRepo.updateStatus(dto.followerId, dto.followingId, existingFollow.status);

		// Event dispatcher handles notifications deletion now
		// We set notificationId manually just in case Event Handler needs it.
		Object.assign(event, { notificationId: dto.notificationId });
		await eventDispatcher.dispatch(event.constructor.name, event);
	}
}
