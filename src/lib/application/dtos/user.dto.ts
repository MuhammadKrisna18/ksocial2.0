import type { UserSearchResult } from '$lib/domain/repositories/IUserRepository';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

export type UserSearchResultDTO = UserSearchResult;

export interface UserSummaryDTO {
	id: string;
	username: string;
	fullName: string;
	email: string;
	profilePictureUrl: string | null;
	coverPhotoUrl: string | null;
	dateOfBirth: Date;
	location: string | null;
	relationshipStatus: string | null;
	isPrivate: boolean;
	requireFollowForMessage: boolean;
	roles: RoleNameType[];
	createdAt: Date;
}

export interface UserProfileDTO {
	id: string;
	username: string;
	fullName: string;
	email: string;
	dateOfBirth: Date;
	location: string | null;
	relationshipStatus: string | null;
	isPrivate: boolean;
	requireFollowForMessage: boolean;
	profilePictureUrl: string | null;
	coverPhotoUrl: string | null;
	followersCount: number;
	followingCount: number;
	followStatus: 'none' | 'pending' | 'following' | 'friends' | 'follows_you';
	isCurrentUser: boolean;
	canViewPosts: boolean;
	createdAt: Date;
}
