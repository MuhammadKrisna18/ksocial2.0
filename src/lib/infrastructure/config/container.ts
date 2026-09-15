import { HashService } from '$lib/infrastructure/external-services/HashService';
import { TokenService } from '$lib/infrastructure/external-services/TokenService';
import { DrizzleUserRepository } from '$lib/infrastructure/repositories/DrizzleUserRepository';
import { DrizzleRoleRepository } from '$lib/infrastructure/repositories/DrizzleRoleRepository';
import { DrizzlePostRepository } from '$lib/infrastructure/repositories/DrizzlePostRepository';
import { LoginUseCase } from '$lib/application/use-cases/LoginUseCase';
import { RegisterUseCase } from '$lib/application/use-cases/RegisterUseCase';
import { ValidateTokenUseCase } from '$lib/application/use-cases/ValidateTokenUseCase';
import { UpdateUserUseCase } from '$lib/application/use-cases/UpdateUserUseCase';
import { GetDashboardStatsUseCase } from '$lib/application/use-cases/GetDashboardStatsUseCase';
import { GetUsersUseCase } from '$lib/application/use-cases/GetUsersUseCase';
import { DeleteAccountUseCase } from '$lib/application/use-cases/DeleteAccountUseCase';
import { CreatePostUseCase } from '$lib/application/use-cases/CreatePostUseCase';
import { GetFeedUseCase } from '$lib/application/use-cases/GetFeedUseCase';

const hashService = new HashService();
const tokenService = new TokenService();
const userRepository = new DrizzleUserRepository();
const roleRepository = new DrizzleRoleRepository();
const postRepository = new DrizzlePostRepository();

export const container = {
	hashService,
	tokenService,
	userRepository,
	roleRepository,
	postRepository,
	loginUseCase: new LoginUseCase(userRepository, hashService, tokenService),
	registerUseCase: new RegisterUseCase(userRepository, roleRepository, hashService, tokenService),
	validateTokenUseCase: new ValidateTokenUseCase(tokenService),
	updateUserUseCase: new UpdateUserUseCase(userRepository, hashService),
	getDashboardStatsUseCase: new GetDashboardStatsUseCase(userRepository),
	getUsersUseCase: new GetUsersUseCase(userRepository),
	deleteAccountUseCase: new DeleteAccountUseCase(userRepository),
	createPostUseCase: new CreatePostUseCase(postRepository),
	getFeedUseCase: new GetFeedUseCase(postRepository)
};
