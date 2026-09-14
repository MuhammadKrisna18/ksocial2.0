import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';

export interface DashboardStatsDTO {
	totalUsers: number;
	activePosts: number;
	reportedContent: number;
}

export class GetDashboardStatsUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(): Promise<DashboardStatsDTO> {
		const totalUsers = await this.userRepo.count();
		
		// Dummy data for features not yet implemented
		const activePosts = 14212;
		const reportedContent = 24;

		return {
			totalUsers,
			activePosts,
			reportedContent
		};
	}
}
