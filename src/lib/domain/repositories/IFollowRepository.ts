import { Follow } from '../entities/Follow';

export interface CreateFollowData {
	followerId: string;
	followingId: string;
	status: 'pending' | 'accepted';
}

import type { FollowStatus } from '../entities/Follow';

export interface FriendUser {
	id: string;
	username: string;
	fullName: string;
	profilePictureUrl: string | null;
}

export interface IFollowRepository {
	create(data: CreateFollowData): Promise<Follow>;
	updateStatus(followerId: string, followingId: string, status: FollowStatus): Promise<void>;
	delete(followerId: string, followingId: string): Promise<void>;
	findByUsers(followerId: string, followingId: string): Promise<Follow | null>;
	getFollowers(userId: string): Promise<Follow[]>;
	getFollowing(userId: string): Promise<Follow[]>;
	getFollowStatus(followerId: string, followingId: string): Promise<string | null>;
	getFollowersDetails(userId: string): Promise<{id: string; username: string; fullName: string; profilePictureUrl: string | null; status: FollowStatus}[]>;
	getFollowingDetails(userId: string): Promise<{id: string; username: string; fullName: string; profilePictureUrl: string | null; status: FollowStatus}[]>;
	getFriends(userId: string): Promise<FriendUser[]>;
}

