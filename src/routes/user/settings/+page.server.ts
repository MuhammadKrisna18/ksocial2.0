import { redirect } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.sub;
	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const user = await container.userRepository.findById(userId);
	
	return {
		isPrivate: user?.isPrivate ?? false
	};
};

export const actions: Actions = {
	updatePrivacy: async ({ request, locals }) => {
		const userId = locals.user?.sub;
		if (!userId) {
			return { success: false, error: 'Unauthorized' };
		}

		const data = await request.formData();
		const isPrivate = data.get('isPrivate') === 'true';

		try {
			await container.updateUserUseCase.updatePrivacy({
				userId,
				isPrivate
			});
			return { success: true };
		} catch (error) {
			return { success: false, error: 'Failed to update privacy settings' };
		}
	}
};
