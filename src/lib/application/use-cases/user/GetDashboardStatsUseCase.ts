import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { ICommentRepository } from '$lib/domain/repositories/ICommentRepository';
import type { IMessageRepository } from '$lib/domain/repositories/IMessageRepository';

export interface RecentActivityItem {
	id: string;
	user: string;
	fullName?: string;
	action: string;
	type: 'user' | 'post' | 'comment';
	createdAt: Date;
}

export interface DashboardStatsDTO {
	totalUsers: number;
	totalPosts: number;
	totalComments: number;
	totalMessages: number;
	recentActivities: RecentActivityItem[];
}

export class GetDashboardStatsUseCase {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly postRepo: IPostRepository,
		private readonly commentRepo: ICommentRepository,
		private readonly messageRepo: IMessageRepository
	) {}

	async execute(): Promise<DashboardStatsDTO> {
		const [
			totalUsers,
			totalPosts,
			totalComments,
			totalMessages,
			recentUsers,
			recentPosts,
			recentComments
		] = await Promise.all([
			this.userRepo.count(),
			this.postRepo.count(),
			this.commentRepo.count(),
			this.messageRepo.count(),
			this.userRepo.getRecentUsers(5),
			this.postRepo.getFeed(),
			this.commentRepo.getRecentComments(5)
		]);

		const userActivities: RecentActivityItem[] = recentUsers.map((u) => ({
			id: `user-${u.id}`,
			user: u.username,
			fullName: u.fullName,
			action: 'bergabung ke K-Social',
			type: 'user',
			createdAt: u.createdAt
		}));

		const postActivities: RecentActivityItem[] = recentPosts.slice(0, 5).map((p) => {
			const cleanContent = p.content.replace(/\s+/g, ' ').trim();
			const snippet = cleanContent.length > 50 ? `${cleanContent.slice(0, 50)}...` : cleanContent;
			return {
				id: `post-${p.id}`,
				user: p.authorUsername,
				fullName: p.authorName,
				action: `membuat postingan: "${snippet}"`,
				type: 'post',
				createdAt: p.createdAt
			};
		});

		const commentActivities: RecentActivityItem[] = recentComments.map((c) => {
			const cleanContent = c.content.replace(/\s+/g, ' ').trim();
			const snippet = cleanContent.length > 50 ? `${cleanContent.slice(0, 50)}...` : cleanContent;
			return {
				id: `comment-${c.id}`,
				user: c.authorUsername,
				action: `menulis komentar: "${snippet}"`,
				type: 'comment',
				createdAt: c.createdAt
			};
		});

		const recentActivities = [...userActivities, ...postActivities, ...commentActivities]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 6);

		return {
			totalUsers,
			totalPosts,
			totalComments,
			totalMessages,
			recentActivities
		};
	}
}
