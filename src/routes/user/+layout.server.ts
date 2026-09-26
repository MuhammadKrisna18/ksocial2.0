import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	let notifications: any[] = [];
	let currentUser = null;
	let unreadMessagesCount = 0;
	try {
		const [userEntity, notifs, unreadCount] = await Promise.all([
			container.getUserByIdUseCase.execute(locals.user.sub),
			container.getNotificationsUseCase.execute(locals.user.sub),
			container.getUnreadMessageCountUseCase.execute(locals.user.sub)
		]);

		if (userEntity) {
			currentUser = {
				id: userEntity.id,
				username: userEntity.username,
				fullName: userEntity.fullName,
				profilePictureUrl: userEntity.profilePictureUrl
			};
		}

		notifications = notifs;
		unreadMessagesCount = unreadCount;
	} catch (err) {
		console.error('Failed to load user or notifications in layout:', err);
	}

	return {
		user: locals.user,
		currentUser,
		notifications,
		unreadMessagesCount
	};
};
