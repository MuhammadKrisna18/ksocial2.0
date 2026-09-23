import type { IUserRepository } from '$lib/domain/repositories/IUserRepository';
import { NotFoundError, ValidationError } from '$lib/application/exceptions';
import type { UserSummaryDTO } from '$lib/application/dtos/user.dto';

export class GetUserByIdUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(userId: string): Promise<UserSummaryDTO> {
		if (!userId) {
			throw new ValidationError('User ID is required');
		}

		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		return {
			id: user.id,
			username: user.username.toString(),
			fullName: user.fullName,
			email: user.email.toString(),
			profilePictureUrl: user.profilePictureUrl,
			coverPhotoUrl: user.coverPhotoUrl,
			dateOfBirth: user.dateOfBirth,
			location: user.location,
			relationshipStatus: user.relationshipStatus,
			isPrivate: user.isPrivate,
			requireFollowForMessage: user.requireFollowForMessage,
			roles: user.roles,
			createdAt: user.createdAt
		};
	}
}
