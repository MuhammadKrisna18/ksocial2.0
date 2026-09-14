import type { PageServerLoad } from './$types';
import { container } from '$lib/infrastructure/config/container';

export const load: PageServerLoad = async () => {
	const users = await container.getUsersUseCase.execute();
	
	return { 
		users 
	};
};
