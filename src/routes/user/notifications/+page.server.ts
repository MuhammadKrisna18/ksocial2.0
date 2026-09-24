import { container } from '$lib/infrastructure/config/container';
import { error, redirect } from '@sveltejs/kit';

export const load = async () => {
    // A simple redirect to /user if someone visits /user/notifications directly.
    throw redirect(302, '/user');
};

export const actions = {
	acceptFollow: async ({ request, locals }) => {
		if (!locals.user?.sub) {
			return { success: false, error: 'Unauthorized' };
		}
		
		const formData = await request.formData();
		const followerId = formData.get('followerId') as string;
		const notificationId = formData.get('notificationId') as string;

		if (!followerId || !notificationId) {
			return { success: false, error: 'Missing data' };
		}

		try {
			await container.acceptFollowUseCase.execute({
				followerId,
				followingId: locals.user.sub,
				notificationId
			});
			return { success: true };
		} catch (err: any) {
			console.error('Accept follow error:', err);
			return { success: false, error: err.message || 'Failed to accept follow' };
		}
	},
	rejectFollow: async ({ request, locals }) => {
		if (!locals.user?.sub) {
			return { success: false, error: 'Unauthorized' };
		}
		
		const formData = await request.formData();
		const followerId = formData.get('followerId') as string;
		const notificationId = formData.get('notificationId') as string;

		if (!followerId || !notificationId) {
			return { success: false, error: 'Missing data' };
		}

		try {
			await container.rejectFollowUseCase.execute({
				followerId,
				followingId: locals.user.sub,
				notificationId
			});
			return { success: true };
		} catch (err: any) {
			console.error('Reject follow error:', err);
			return { success: false, error: err.message || 'Failed to reject follow' };
		}
	},
	dismiss: async ({ request, locals }) => {
		if (!locals.user?.sub) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const notificationId = formData.get('notificationId') as string;

		if (!notificationId) {
			return { success: false, error: 'Notification ID is required' };
		}

		try {
			await container.dismissNotificationUseCase.execute(notificationId, locals.user.sub);
			return { success: true };
		} catch (err: any) {
			console.error('Dismiss notification error:', err);
			return { success: false, error: err.message || 'Failed to dismiss notification' };
		}
	}
};
