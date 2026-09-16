import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';

export interface GetFollowStatusDTO {
	currentUser: string;
	targetUser: string;
}

export interface FollowStatusResult {
	status: 'none' | 'pending' | 'following' | 'friends' | 'follows_you';
}

export class GetFollowStatusUseCase {
	constructor(private followRepo: IFollowRepository) {}

	async execute(dto: GetFollowStatusDTO): Promise<FollowStatusResult> {
		const currentFollowsTarget = await this.followRepo.findByUsers(dto.currentUser, dto.targetUser);
		const targetFollowsCurrent = await this.followRepo.findByUsers(dto.targetUser, dto.currentUser);

		if (!currentFollowsTarget) {
			if (targetFollowsCurrent?.status === 'accepted') {
				return { status: 'follows_you' };
			}
			return { status: 'none' };
		}

		if (currentFollowsTarget.status === 'pending') {
			return { status: 'pending' };
		}

		if (currentFollowsTarget.status === 'accepted' && targetFollowsCurrent?.status === 'accepted') {
			return { status: 'friends' };
		}

		return { status: 'following' };
	}
}
