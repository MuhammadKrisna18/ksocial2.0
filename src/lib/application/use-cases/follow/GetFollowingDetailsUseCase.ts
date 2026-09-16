import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';

export class GetFollowingDetailsUseCase {
	constructor(private readonly followRepository: IFollowRepository) {}

	async execute(userId: string) {
		return await this.followRepository.getFollowingDetails(userId);
	}
}
