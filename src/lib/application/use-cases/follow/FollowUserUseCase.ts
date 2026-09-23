import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';
import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IEventDispatcher } from '$lib/application/interfaces/IEventDispatcher';
import { NotFoundError, ConflictError, ValidationError } from '$lib/application/exceptions';

export interface FollowUserDTO {
	followerId: string;
	followingId?: string;
	followingUsername?: string;
}

export class FollowUserUseCase {
	constructor(
		private followRepo: IFollowRepository,
		private userRepo: IUserRepository,
		private eventDispatcher: IEventDispatcher
	) {}

	async execute(dto: FollowUserDTO): Promise<{ status: 'pending' | 'accepted' }> {
		if (!dto.followingId && dto.followingUsername) {
			const targetUser = await this.userRepo.findByUsername(dto.followingUsername);
			if (!targetUser) {
				throw new NotFoundError('User not found');
			}
			dto.followingId = targetUser.id;
		}

		if (!dto.followingId) {
			throw new ValidationError('Target user ID or username is required');
		}

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
			await this.eventDispatcher.dispatch(event.constructor.name, event);
		}

		return { status };
	}
}
