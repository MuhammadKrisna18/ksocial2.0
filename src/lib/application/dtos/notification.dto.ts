export interface NotificationDTO {
	id: string;
	type: string;
	senderId: string;
	senderUsername?: string;
	senderName?: string;
	resourceId?: string | null;
	read: boolean;
	createdAt: Date;
}
