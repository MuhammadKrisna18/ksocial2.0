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
		const userEntity = await container.getUserByIdUseCase.execute(locals.user.sub);
		if (userEntity) {
			currentUser = {
				id: userEntity.id,
				username: userEntity.username,
				fullName: userEntity.fullName,
				profilePictureUrl: userEntity.profilePictureUrl
			};
		}

		notifications = await container.getNotificationsUseCase.execute(locals.user.sub);
		unreadMessagesCount = await container.getUnreadMessageCountUseCase.execute(locals.user.sub);
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
