import { Follow } from '../entities/Follow';

export interface CreateFollowData {
	followerId: string;
	followingId: string;
	status: 'pending' | 'accepted';
}

export interface IFollowRepository {
	create(data: CreateFollowData): Promise<Follow>;
	updateStatus(followerId: string, followingId: string, status: 'accepted'): Promise<void>;
	delete(followerId: string, followingId: string): Promise<void>;
	findByUsers(followerId: string, followingId: string): Promise<Follow | null>;
	getFollowers(userId: string): Promise<Follow[]>;
	getFollowing(userId: string): Promise<Follow[]>;
}
