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
import { CreatePostUseCase } from '$lib/application/use-cases/post/CreatePostUseCase';
import { GetFeedUseCase } from '$lib/application/use-cases/post/GetFeedUseCase';
import { ToggleSavePostUseCase } from '$lib/application/use-cases/post/ToggleSavePostUseCase';
import { GetSavedPostsUseCase } from '$lib/application/use-cases/post/GetSavedPostsUseCase';
import { DeletePostUseCase } from '$lib/application/use-cases/post/DeletePostUseCase';
import { SharePostUseCase } from '$lib/application/use-cases/post/SharePostUseCase';
import { GetFollowersDetailsUseCase } from '$lib/application/use-cases/follow/GetFollowersDetailsUseCase';
import { GetFollowingDetailsUseCase } from '$lib/application/use-cases/follow/GetFollowingDetailsUseCase';
import { GetUserPostsUseCase } from '$lib/application/use-cases/post/GetUserPostsUseCase';
import { GetPostLikesUseCase } from '$lib/application/use-cases/post/GetPostLikesUseCase';
import { FollowUserUseCase } from '$lib/application/use-cases/follow/FollowUserUseCase';
import { AcceptFollowUseCase } from '$lib/application/use-cases/follow/AcceptFollowUseCase';
import { RejectFollowUseCase } from '$lib/application/use-cases/follow/RejectFollowUseCase';
import { GetFollowStatusUseCase } from '$lib/application/use-cases/follow/GetFollowStatusUseCase';
import { GetNotificationsUseCase } from '$lib/application/use-cases/notification/GetNotificationsUseCase';
import { DrizzleLikeRepository } from '$lib/infrastructure/repositories/DrizzleLikeRepository';
import { DrizzleCommentRepository } from '$lib/infrastructure/repositories/DrizzleCommentRepository';
import { DrizzleMessageRepository } from '$lib/infrastructure/repositories/DrizzleMessageRepository';
import { ToggleLikeUseCase } from '$lib/application/use-cases/post/ToggleLikeUseCase';
import { AddCommentUseCase } from '$lib/application/use-cases/post/AddCommentUseCase';
import { GetCommentsUseCase } from '$lib/application/use-cases/post/GetCommentsUseCase';
import { ToggleCommentLikeUseCase } from '$lib/application/use-cases/post/ToggleCommentLikeUseCase';
import { ToggleSaveCommentUseCase } from '$lib/application/use-cases/post/ToggleSaveCommentUseCase';
import { DeleteCommentUseCase } from '$lib/application/use-cases/post/DeleteCommentUseCase';
import { GetSavedCommentsUseCase } from '$lib/application/use-cases/post/GetSavedCommentsUseCase';
import { eventDispatcher } from '$lib/infrastructure/events/DomainEventDispatcher';
import { NotificationEventHandler } from '$lib/application/event-handlers/NotificationEventHandler';
import { SearchUsersUseCase } from '$lib/application/use-cases/search/SearchUsersUseCase';
import { GetMessagesUseCase } from '$lib/application/use-cases/chat/GetMessagesUseCase';
import { SendMessageUseCase } from '$lib/application/use-cases/chat/SendMessageUseCase';
import { GetChatContactsUseCase } from '$lib/application/use-cases/chat/GetChatContactsUseCase';
import { GetUnreadMessageCountUseCase } from '$lib/application/use-cases/chat/GetUnreadMessageCountUseCase';
import { MarkMessagesAsReadUseCase } from '$lib/application/use-cases/chat/MarkMessagesAsReadUseCase';
import { UnfollowUserUseCase } from '$lib/application/use-cases/follow/UnfollowUserUseCase';
import { GetUserProfileUseCase } from '$lib/application/use-cases/user/GetUserProfileUseCase';
import { GetUserByIdUseCase } from '$lib/application/use-cases/user/GetUserByIdUseCase';
import { GetFriendsUseCase } from '$lib/application/use-cases/follow/GetFriendsUseCase';

class Container {
	constructor() {
		this.initEventHandlers();
	}

	// --- Services & Repositories (Singletons, encapsulated) ---
	private _hashService?: HashService;
	private get hashService(): HashService {
		if (!this._hashService) this._hashService = new HashService();
		return this._hashService;
	}

	private _tokenService?: TokenService;
	private get tokenService(): TokenService {
		if (!this._tokenService) this._tokenService = new TokenService();
		return this._tokenService;
	}

	private _userRepository?: DrizzleUserRepository;
	private get userRepository(): DrizzleUserRepository {
		if (!this._userRepository) this._userRepository = new DrizzleUserRepository();
		return this._userRepository;
	}

	private _roleRepository?: DrizzleRoleRepository;
	private get roleRepository(): DrizzleRoleRepository {
		if (!this._roleRepository) this._roleRepository = new DrizzleRoleRepository();
		return this._roleRepository;
	}

	private _postRepository?: DrizzlePostRepository;
	private get postRepository(): DrizzlePostRepository {
		if (!this._postRepository) this._postRepository = new DrizzlePostRepository();
		return this._postRepository;
	}

	private _followRepository?: DrizzleFollowRepository;
	private get followRepository(): DrizzleFollowRepository {
		if (!this._followRepository) this._followRepository = new DrizzleFollowRepository();
		return this._followRepository;
	}

	private _notificationRepository?: DrizzleNotificationRepository;
	private get notificationRepository(): DrizzleNotificationRepository {
		if (!this._notificationRepository) this._notificationRepository = new DrizzleNotificationRepository();
		return this._notificationRepository;
	}

	private _likeRepository?: DrizzleLikeRepository;
	private get likeRepository(): DrizzleLikeRepository {
		if (!this._likeRepository) this._likeRepository = new DrizzleLikeRepository();
		return this._likeRepository;
	}

	private _commentRepository?: DrizzleCommentRepository;
	private get commentRepository(): DrizzleCommentRepository {
		if (!this._commentRepository) this._commentRepository = new DrizzleCommentRepository();
		return this._commentRepository;
	}

	private _messageRepository?: DrizzleMessageRepository;
	private get messageRepository(): DrizzleMessageRepository {
		if (!this._messageRepository) this._messageRepository = new DrizzleMessageRepository();
		return this._messageRepository;
	}

	private _notificationEventHandler?: NotificationEventHandler;
	private initEventHandlers(): void {
		if (!this._notificationEventHandler) {
			this._notificationEventHandler = new NotificationEventHandler(this.notificationRepository);
			
			eventDispatcher.register('UserFollowRequestedEvent', (event: any) => this._notificationEventHandler!.handleFollowRequested(event));
			eventDispatcher.register('UserFollowAcceptedEvent', (event: any) => this._notificationEventHandler!.handleFollowAccepted(event));
			eventDispatcher.register('PostLikedEvent', (event: any) => this._notificationEventHandler!.handlePostLiked(event));
			eventDispatcher.register('PostCommentedEvent', (event: any) => this._notificationEventHandler!.handlePostCommented(event));
		}
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


	get createPostUseCase(): CreatePostUseCase {
		return new CreatePostUseCase(this.postRepository);
	}

	get getFollowersDetailsUseCase(): GetFollowersDetailsUseCase {
		return new GetFollowersDetailsUseCase(this.followRepository);
	}

	get getFollowingDetailsUseCase(): GetFollowingDetailsUseCase {
		return new GetFollowingDetailsUseCase(this.followRepository);
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
		return new ToggleLikeUseCase(this.likeRepository, this.postRepository, eventDispatcher);
	}

	get addCommentUseCase(): AddCommentUseCase {
		return new AddCommentUseCase(this.commentRepository, this.postRepository, eventDispatcher);
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
		return new FollowUserUseCase(this.followRepository, this.userRepository, eventDispatcher);
	}

	get unfollowUserUseCase(): UnfollowUserUseCase {
		return new UnfollowUserUseCase(this.followRepository, this.userRepository);
	}

	get acceptFollowUseCase(): AcceptFollowUseCase {
		return new AcceptFollowUseCase(this.followRepository, eventDispatcher);
	}

	get rejectFollowUseCase(): RejectFollowUseCase {
		return new RejectFollowUseCase(this.followRepository, this.notificationRepository);
	}

	get getFollowStatusUseCase(): GetFollowStatusUseCase {
		return new GetFollowStatusUseCase(this.followRepository);
	}

	get getUserProfileUseCase(): GetUserProfileUseCase {
		return new GetUserProfileUseCase(this.userRepository, this.followRepository);
	}

	get getUserByIdUseCase(): GetUserByIdUseCase {
		return new GetUserByIdUseCase(this.userRepository);
	}

	get getNotificationsUseCase(): GetNotificationsUseCase {
		return new GetNotificationsUseCase(this.notificationRepository, this.userRepository);
	}

	get getMessagesUseCase(): GetMessagesUseCase {
		return new GetMessagesUseCase(this.messageRepository);
	}

	get sendMessageUseCase(): SendMessageUseCase {
		return new SendMessageUseCase(this.messageRepository, this.userRepository, this.followRepository, eventDispatcher);
	}

	get getChatContactsUseCase(): GetChatContactsUseCase {
		return new GetChatContactsUseCase(this.messageRepository);
	}

	get searchUsersUseCase(): SearchUsersUseCase {
		return new SearchUsersUseCase(this.userRepository);
	}

	get getFriendsUseCase(): GetFriendsUseCase {
		return new GetFriendsUseCase(this.followRepository);
	}

	get getUnreadMessageCountUseCase(): GetUnreadMessageCountUseCase {
		return new GetUnreadMessageCountUseCase(this.messageRepository);
	}

	get markMessagesAsReadUseCase(): MarkMessagesAsReadUseCase {
		return new MarkMessagesAsReadUseCase(this.messageRepository);
	}
}


export const container = new Container();

