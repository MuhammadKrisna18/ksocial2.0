import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	let notifications: any[] = [];
	try {
		const rawNotifications = await container.getNotificationsUseCase.execute(locals.user.sub);
		
		notifications = await Promise.all(
			rawNotifications.map(async (n) => {
				const sender = await container.userRepository.findById(n.senderId);
				return {
					id: n.id,
					type: n.type,
					senderId: n.senderId,
					senderUsername: sender?.username?.toString(),
					senderName: sender?.fullName,
					resourceId: n.resourceId,
					read: n.read,
					createdAt: n.createdAt
				};
			})
		);
	} catch (err) {
		console.error('Failed to load notifications in layout:', err);
	}

	return {
		user: locals.user,
		notifications
	};
};
