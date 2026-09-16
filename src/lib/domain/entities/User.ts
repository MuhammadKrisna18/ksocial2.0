import type { RoleNameType } from '$lib/domain/value-objects/RoleName';
import type { Email } from '$lib/domain/value-objects/Email';
import type { Username } from '$lib/domain/value-objects/Username';
import { UserFollowRequestedEvent } from '$lib/domain/events/UserFollowRequestedEvent';
import { UserFollowAcceptedEvent } from '$lib/domain/events/UserFollowAcceptedEvent';

export interface UserProps {
	id: string;
	fullName: string;
	email: Email;
	passwordHash: string;
	username: Username;
	roles: RoleNameType[];
	dateOfBirth: Date;
	isPrivate: boolean;
	profilePictureUrl?: string | null;
	coverPhotoUrl?: string | null;
	location?: string | null;
	relationshipStatus?: string | null;
	requireFollowForMessage: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class User {
	private constructor(private readonly props: UserProps) {}

	get id(): string { return this.props.id; }
	get fullName(): string { return this.props.fullName; }
	get email(): Email { return this.props.email; }
	get username(): Username { return this.props.username; }
	get passwordHash(): string { return this.props.passwordHash; }
	get roles(): RoleNameType[] { return this.props.roles || []; }
	get profilePictureUrl(): string | null { return this.props.profilePictureUrl || null; }
	get coverPhotoUrl(): string | null { return this.props.coverPhotoUrl || null; }
	get location(): string | null { return this.props.location || null; }
	get relationshipStatus(): string | null { return this.props.relationshipStatus || null; }
	get dateOfBirth(): Date { return this.props.dateOfBirth; }
	get isPrivate(): boolean { return this.props.isPrivate; }
	get requireFollowForMessage(): boolean { return this.props.requireFollowForMessage; }
	get createdAt(): Date { return this.props.createdAt; }
	get updatedAt(): Date { return this.props.updatedAt; }

	static create(props: UserProps): User {
		return new User(props);
	}

	updateProfile(
		fullName?: string,
		profilePictureUrl?: string | null,
		coverPhotoUrl?: string | null,
		location?: string | null,
		relationshipStatus?: string | null,
		dateOfBirth?: Date,
		isPrivate?: boolean,
		requireFollowForMessage?: boolean
	): void {
		if (fullName !== undefined) this.props.fullName = fullName;
		if (profilePictureUrl !== undefined) this.props.profilePictureUrl = profilePictureUrl;
		if (coverPhotoUrl !== undefined) this.props.coverPhotoUrl = coverPhotoUrl;
		if (location !== undefined) this.props.location = location;
		if (relationshipStatus !== undefined) this.props.relationshipStatus = relationshipStatus;
		if (dateOfBirth !== undefined) this.props.dateOfBirth = dateOfBirth;
		if (isPrivate !== undefined) this.props.isPrivate = isPrivate;
		if (requireFollowForMessage !== undefined) this.props.requireFollowForMessage = requireFollowForMessage;
		this.props.updatedAt = new Date();
	}

	hasRole(role: RoleNameType): boolean {
		return this.roles.includes(role);
	}

	isAdmin(): boolean {
		return this.hasRole('admin');
	}

	canViewProfileOf(otherUser: User, followStatus?: string): boolean {
		if (this.id === otherUser.id) return true;
		if (this.isAdmin()) return true;
		if (!otherUser.isPrivate) return true;
		if (followStatus === 'accepted') return true;
		return false;
	}

	processFollowRequest(followerId: string): { status: 'pending' | 'accepted'; event: any } {
		const status = this.isPrivate ? 'pending' : 'accepted';
		let event;
		
		if (status === 'pending') {
			event = new UserFollowRequestedEvent(followerId, this.id);
		} else {
			event = new UserFollowAcceptedEvent(followerId, this.id);
		}
		
		return { status, event };
	}
}
