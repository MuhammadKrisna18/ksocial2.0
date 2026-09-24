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
		if (!existingFollow) {
			throw new NotFoundError('No follow request found');
		}

		if (existingFollow.status === 'pending') {
			const event = existingFollow.accept();
			await this.followRepo.updateStatus(dto.followerId, dto.followingId, existingFollow.status);
			Object.assign(event, { notificationId: dto.notificationId });
			await this.eventDispatcher.dispatch(event.constructor.name, event);
			return;
		}

		if (existingFollow.status === 'accepted') {
			// Already accepted (e.g. from a duplicate notification). Clean up any leftover notifications.
			const event = {
				followerId: dto.followerId,
				followingId: dto.followingId,
				notificationId: dto.notificationId
			};
			await this.eventDispatcher.dispatch('UserFollowAcceptedEvent', event as any);
		}
	}
}
