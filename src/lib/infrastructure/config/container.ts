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
import { ToggleSavePostUseCase } from '$lib/application/use-cases/ToggleSavePostUseCase';
import { GetSavedPostsUseCase } from '$lib/application/use-cases/GetSavedPostsUseCase';

class Container {
	// --- Services & Repositories (Singletons) ---
	private _hashService?: HashService;
	get hashService(): HashService {
		if (!this._hashService) this._hashService = new HashService();
		return this._hashService;
	}

	private _tokenService?: TokenService;
	get tokenService(): TokenService {
		if (!this._tokenService) this._tokenService = new TokenService();
		return this._tokenService;
	}

	private _userRepository?: DrizzleUserRepository;
	get userRepository(): DrizzleUserRepository {
		if (!this._userRepository) this._userRepository = new DrizzleUserRepository();
		return this._userRepository;
	}

	private _roleRepository?: DrizzleRoleRepository;
	get roleRepository(): DrizzleRoleRepository {
		if (!this._roleRepository) this._roleRepository = new DrizzleRoleRepository();
		return this._roleRepository;
	}

	private _postRepository?: DrizzlePostRepository;
	get postRepository(): DrizzlePostRepository {
		if (!this._postRepository) this._postRepository = new DrizzlePostRepository();
		return this._postRepository;
	}

	// --- Use Cases (Lazy instantiated) ---
	get loginUseCase(): LoginUseCase {
		return new LoginUseCase(this.userRepository, this.hashService, this.tokenService);
	}

	get registerUseCase(): RegisterUseCase {
		return new RegisterUseCase(this.userRepository, this.roleRepository, this.hashService, this.tokenService);
	}

	get validateTokenUseCase(): ValidateTokenUseCase {
		return new ValidateTokenUseCase(this.tokenService);
	}

	get updateUserUseCase(): UpdateUserUseCase {
		return new UpdateUserUseCase(this.userRepository, this.hashService);
	}

	get getDashboardStatsUseCase(): GetDashboardStatsUseCase {
		return new GetDashboardStatsUseCase(this.userRepository);
	}

	get getUsersUseCase(): GetUsersUseCase {
		return new GetUsersUseCase(this.userRepository);
	}

	get deleteAccountUseCase(): DeleteAccountUseCase {
		return new DeleteAccountUseCase(this.userRepository);
	}

	get createPostUseCase(): CreatePostUseCase {
		return new CreatePostUseCase(this.postRepository);
	}

	get getFeedUseCase(): GetFeedUseCase {
		return new GetFeedUseCase(this.postRepository);
	}

	get toggleSavePostUseCase(): ToggleSavePostUseCase {
		return new ToggleSavePostUseCase(this.postRepository);
	}

	get getSavedPostsUseCase(): GetSavedPostsUseCase {
		return new GetSavedPostsUseCase(this.postRepository);
	}
}

export const container = new Container();
