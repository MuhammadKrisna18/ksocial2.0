import { HashService } from '$lib/infrastructure/external-services/HashService';
import { TokenService } from '$lib/infrastructure/external-services/TokenService';
import { DrizzleUserRepository } from '$lib/infrastructure/repositories/DrizzleUserRepository';
import { DrizzleRoleRepository } from '$lib/infrastructure/repositories/DrizzleRoleRepository';
import { DrizzlePostRepository } from '$lib/infrastructure/repositories/DrizzlePostRepository';
import { DrizzleFollowRepository } from '$lib/infrastructure/repositories/DrizzleFollowRepository';
import { DrizzleNotificationRepository } from '$lib/infrastructure/repositories/DrizzleNotificationRepository';
import { LoginUseCase } from '$lib/application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '$lib/application/use-cases/auth/RegisterUseCase';
import { ValidateTokenUseCase } from '$lib/application/use-cases/auth/ValidateTokenUseCase';
import { UpdateUserUseCase } from '$lib/application/use-cases/user/UpdateUserUseCase';
import { GetDashboardStatsUseCase } from '$lib/application/use-cases/user/GetDashboardStatsUseCase';
import { GetUsersUseCase } from '$lib/application/use-cases/user/GetUsersUseCase';
import { DeleteAccountUseCase } from '$lib/application/use-cases/user/DeleteAccountUseCase';
import { CreatePostUseCase } from '$lib/application/use-cases/post/CreatePostUseCase';
import { GetFeedUseCase } from '$lib/application/use-cases/post/GetFeedUseCase';
import { ToggleSavePostUseCase } from '$lib/application/use-cases/post/ToggleSavePostUseCase';
import { GetSavedPostsUseCase } from '$lib/application/use-cases/post/GetSavedPostsUseCase';
import { DeletePostUseCase } from '$lib/application/use-cases/post/DeletePostUseCase';
import { SharePostUseCase } from '$lib/application/use-cases/post/SharePostUseCase';
import { GetUserPostsUseCase } from '$lib/application/use-cases/post/GetUserPostsUseCase';
import { GetPostLikesUseCase } from '$lib/application/use-cases/post/GetPostLikesUseCase';
import { FollowUserUseCase } from '$lib/application/use-cases/follow/FollowUserUseCase';
import { AcceptFollowUseCase } from '$lib/application/use-cases/follow/AcceptFollowUseCase';
import { RejectFollowUseCase } from '$lib/application/use-cases/follow/RejectFollowUseCase';
import { GetFollowStatusUseCase } from '$lib/application/use-cases/follow/GetFollowStatusUseCase';
import { GetNotificationsUseCase } from '$lib/application/use-cases/notification/GetNotificationsUseCase';
import { DrizzleLikeRepository } from '$lib/infrastructure/repositories/DrizzleLikeRepository';
import { DrizzleCommentRepository } from '$lib/infrastructure/repositories/DrizzleCommentRepository';
import { ToggleLikeUseCase } from '$lib/application/use-cases/post/ToggleLikeUseCase';
import { AddCommentUseCase } from '$lib/application/use-cases/post/AddCommentUseCase';
import { GetCommentsUseCase } from '$lib/application/use-cases/post/GetCommentsUseCase';
import { ToggleCommentLikeUseCase } from '$lib/application/use-cases/post/ToggleCommentLikeUseCase';
import { ToggleSaveCommentUseCase } from '$lib/application/use-cases/post/ToggleSaveCommentUseCase';
import { DeleteCommentUseCase } from '$lib/application/use-cases/post/DeleteCommentUseCase';
import { GetSavedCommentsUseCase } from '$lib/application/use-cases/post/GetSavedCommentsUseCase';
import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import { NotificationEventHandler } from '$lib/application/event-handlers/NotificationEventHandler';

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

	private _followRepository?: DrizzleFollowRepository;
	get followRepository(): DrizzleFollowRepository {
		if (!this._followRepository) this._followRepository = new DrizzleFollowRepository();
		return this._followRepository;
	}

	private _notificationRepository?: DrizzleNotificationRepository;
	get notificationRepository(): DrizzleNotificationRepository {
		if (!this._notificationRepository) this._notificationRepository = new DrizzleNotificationRepository();
		return this._notificationRepository;
	}

	private _likeRepository?: DrizzleLikeRepository;
	get likeRepository(): DrizzleLikeRepository {
		if (!this._likeRepository) this._likeRepository = new DrizzleLikeRepository();
		return this._likeRepository;
	}

	private _commentRepository?: DrizzleCommentRepository;
	get commentRepository(): DrizzleCommentRepository {
		if (!this._commentRepository) this._commentRepository = new DrizzleCommentRepository();
		return this._commentRepository;
	}

	private _notificationEventHandler?: NotificationEventHandler;
	get notificationEventHandler(): NotificationEventHandler {
		if (!this._notificationEventHandler) {
			this._notificationEventHandler = new NotificationEventHandler(this.notificationRepository);
			
			eventDispatcher.register('UserFollowRequestedEvent', (event: any) => this._notificationEventHandler!.handleFollowRequested(event));
			eventDispatcher.register('UserFollowAcceptedEvent', (event: any) => this._notificationEventHandler!.handleFollowAccepted(event));
		}
		return this._notificationEventHandler;
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

	get deletePostUseCase(): DeletePostUseCase {
		return new DeletePostUseCase(this.postRepository);
	}

	get sharePostUseCase(): SharePostUseCase {
		return new SharePostUseCase(this.postRepository);
	}

	get getPostLikesUseCase(): GetPostLikesUseCase {
		return new GetPostLikesUseCase(this.postRepository);
	}

	get getUserPostsUseCase(): GetUserPostsUseCase {
		return new GetUserPostsUseCase(this.postRepository);
	}

	get toggleLikeUseCase(): ToggleLikeUseCase {
		return new ToggleLikeUseCase(this.likeRepository);
	}

	get addCommentUseCase(): AddCommentUseCase {
		return new AddCommentUseCase(this.commentRepository);
	}

	get getCommentsUseCase(): GetCommentsUseCase {
		return new GetCommentsUseCase(this.commentRepository);
	}

	get toggleCommentLikeUseCase(): ToggleCommentLikeUseCase {
		return new ToggleCommentLikeUseCase(this.commentRepository);
	}

	get toggleSaveCommentUseCase(): ToggleSaveCommentUseCase {
		return new ToggleSaveCommentUseCase(this.commentRepository);
	}

	get getSavedCommentsUseCase(): GetSavedCommentsUseCase {
		return new GetSavedCommentsUseCase(this.commentRepository);
	}

	get deleteCommentUseCase(): DeleteCommentUseCase {
		return new DeleteCommentUseCase(this.commentRepository, this.postRepository);
	}

	get followUserUseCase(): FollowUserUseCase {
		return new FollowUserUseCase(this.followRepository, this.userRepository);
	}

	get acceptFollowUseCase(): AcceptFollowUseCase {
		return new AcceptFollowUseCase(this.followRepository);
	}

	get rejectFollowUseCase(): RejectFollowUseCase {
		return new RejectFollowUseCase(this.followRepository, this.notificationRepository);
	}

	get getFollowStatusUseCase(): GetFollowStatusUseCase {
		return new GetFollowStatusUseCase(this.followRepository);
	}

	get getNotificationsUseCase(): GetNotificationsUseCase {
		return new GetNotificationsUseCase(this.notificationRepository);
	}
}

export const container = new Container();

// Initialize event handlers
container.notificationEventHandler;

