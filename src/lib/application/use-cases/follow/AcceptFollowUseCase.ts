import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { IEventDispatcher } from '$lib/application/interfaces/IEventDispatcher';
import { NotFoundError } from '$lib/application/exceptions';

export interface AcceptFollowDTO {
	followerId: string;
	followingId: string; // The user who is accepting the follow request
	notificationId?: string;
}

export class AcceptFollowUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private eventDispatcher: IEventDispatcher
	) {}

	async execute(dto: AcceptFollowDTO): Promise<void> {
		const existingFollow = await this.followRepo.findByUsers(dto.followerId, dto.followingId);
		if (!existingFollow || existingFollow.status !== 'pending') {
			throw new NotFoundError('No pending follow request found');
		}

		const event = existingFollow.accept();
		
		await this.followRepo.updateStatus(dto.followerId, dto.followingId, existingFollow.status);

		// Event dispatcher handles notifications deletion now
		// We set notificationId manually just in case Event Handler needs it.
		Object.assign(event, { notificationId: dto.notificationId });
		await this.eventDispatcher.dispatch(event.constructor.name, event);
	}
}
