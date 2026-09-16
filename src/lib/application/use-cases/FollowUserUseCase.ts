import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import { NotFoundError, ConflictError } from '$lib/application/exceptions';

export interface FollowUserDTO {
	followerId: string;
	followingId: string;
}

export class FollowUserUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private userRepo: IUserRepository
	) {}

	async execute(dto: FollowUserDTO): Promise<{ status: 'pending' | 'accepted' }> {
		if (dto.followerId === dto.followingId) {
			throw new ConflictError('Cannot follow yourself');
		}

		const followingUser = await this.userRepo.findById(dto.followingId);
		if (!followingUser) {
			throw new NotFoundError('User not found');
		}

		const existingFollow = await this.followRepo.findByUsers(dto.followerId, dto.followingId);
		if (existingFollow) {
			throw new ConflictError('Already following or request pending');
		}

		const { status, event } = followingUser.processFollowRequest(dto.followerId);

		await this.followRepo.create({
			followerId: dto.followerId,
			followingId: dto.followingId,
			status
		});

		if (event) {
			await eventDispatcher.dispatch(event.constructor.name, event);
		}

		return { status };
	}
}
