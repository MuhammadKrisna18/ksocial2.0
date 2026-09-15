import { Notification } from '../entities/Notification';

export interface CreateNotificationData {
	id: string;
	userId: string;
	senderId: string;
	type: string;
}

export interface INotificationRepository {
	create(data: CreateNotificationData): Promise<Notification>;
	findById(id: string): Promise<Notification | null>;
	findByUser(userId: string): Promise<Notification[]>;
	markAsRead(id: string): Promise<void>;
	delete(id: string): Promise<void>;
	deleteByDetails(userId: string, senderId: string, type: string): Promise<void>;
}
