import type { INotificationRepository } from '$lib/domain/repositories/INotificationRepository';
import { UserFollowRequestedEvent } from '$lib/domain/events/UserFollowRequestedEvent';
import { UserFollowAcceptedEvent } from '$lib/domain/events/UserFollowAcceptedEvent';
import { PostLikedEvent } from '$lib/domain/events/PostLikedEvent';
import { PostCommentedEvent } from '$lib/domain/events/PostCommentedEvent';

export class NotificationEventHandler {
	constructor(private notificationRepo: INotificationRepository) {}

	async handleFollowRequested(event: UserFollowRequestedEvent): Promise<void> {
		// Prevent creating duplicate follow_request notification
		const existing = await this.notificationRepo.findExisting(event.followingId, event.followerId, 'follow_request');
		if (existing) {
			return;
		}

		const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		await this.notificationRepo.create({
			id,
			userId: event.followingId,
			senderId: event.followerId,
			type: 'follow_request'
		});
	}

	async handleFollowAccepted(event: UserFollowAcceptedEvent): Promise<void> {
		// Always delete ALL follow_request notifications between these users
		await this.notificationRepo.deleteByDetails(event.followingId, event.followerId, 'follow_request');
		if (event.notificationId) {
			await this.notificationRepo.delete(event.notificationId);
		}
	}

	async handlePostLiked(event: PostLikedEvent): Promise<void> {
		if (event.likerId === event.authorId) return; // Don't notify if user likes their own post

		const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		await this.notificationRepo.create({
			id,
			userId: event.authorId,
			senderId: event.likerId,
			type: 'like',
			resourceId: event.postId
		});
	}

	async handlePostCommented(event: PostCommentedEvent): Promise<void> {
		if (event.commenterId === event.authorId) return; // Don't notify if user comments on their own post

		const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		await this.notificationRepo.create({
			id,
			userId: event.authorId,
			senderId: event.commenterId,
			type: 'comment',
			resourceId: event.postId
		});
	}
}
