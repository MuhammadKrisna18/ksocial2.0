import type { IFollowRepository } from '$lib/domain/repositories/IFollowRepository';

export class GetFollowersDetailsUseCase {
	constructor(private readonly followRepository: IFollowRepository) {}

	async execute(userId: string) {
		return await this.followRepository.getFollowersDetails(userId);
	}
}
