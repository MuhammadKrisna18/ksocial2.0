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
	createdAt: Date;
	updatedAt: Date;
}

export class User {
	readonly id: string;
	readonly fullName: string;
	readonly email: Email;
	readonly passwordHash: string;
	readonly username: Username;
	readonly roles: RoleNameType[];
	readonly dateOfBirth: Date;
	readonly isPrivate: boolean;
	readonly profilePictureUrl?: string | null;
	readonly coverPhotoUrl?: string | null;
	readonly location?: string | null;
	readonly relationshipStatus?: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(props: UserProps) {
		this.id = props.id;
		this.fullName = props.fullName;
		this.email = props.email;
		this.passwordHash = props.passwordHash;
		this.username = props.username;
		this.roles = props.roles;
		this.dateOfBirth = props.dateOfBirth;
		this.isPrivate = props.isPrivate;
		this.profilePictureUrl = props.profilePictureUrl;
		this.coverPhotoUrl = props.coverPhotoUrl;
		this.location = props.location;
		this.relationshipStatus = props.relationshipStatus;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
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
