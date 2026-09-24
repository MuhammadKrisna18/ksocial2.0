export interface IncomingChatMessage {
	id: string;
	senderId: string;
	receiverId: string;
	content: string;
	isRead: boolean;
	createdAt: string;
	senderName?: string;
	senderUsername?: string;
	senderAvatar?: string | null;
}

export interface ChatToast {
	id: string;
	senderId: string;
	senderName: string;
	senderUsername: string;
	senderAvatar: string | null;
	content: string;
	createdAt: string;
}

type MessageListener = (message: IncomingChatMessage) => void;

class ChatState {
	totalUnread = $state(0);
	activeContactId = $state<string | null>(null);
	activeToast = $state<ChatToast | null>(null);

	private isInitialized = false;
	private toastTimer: ReturnType<typeof setTimeout> | null = null;
	private listeners = new Set<MessageListener>();

	init(initialCount: number) {
		if (!this.isInitialized) {
			this.totalUnread = Math.max(0, initialCount);
			this.isInitialized = true;
		}
	}

	setUnread(count: number) {
		this.totalUnread = Math.max(0, count);
	}

	incrementUnread() {
		this.totalUnread += 1;
	}

	decrementUnread(count: number) {
		this.totalUnread = Math.max(0, this.totalUnread - count);
	}

	subscribeMessages(listener: MessageListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	handleIncomingMessage(message: IncomingChatMessage, currentUserId: string) {
		// Broadcast to any active page listener (e.g. /user/messages page)
		for (const listener of this.listeners) {
			try {
				listener(message);
			} catch (e) {
				console.error('Error in chat message listener:', e);
			}
		}

		// Only handle unread count and toast if this is an incoming message for current user
		if (message.receiverId === currentUserId) {
			const isCurrentChatOpen = this.activeContactId === message.senderId;

			if (!isCurrentChatOpen) {
				this.incrementUnread();
				this.showToast({
					id: message.id,
					senderId: message.senderId,
					senderName: message.senderName || 'Pengguna',
					senderUsername: message.senderUsername || '',
					senderAvatar: message.senderAvatar ?? null,
					content: message.content,
					createdAt: message.createdAt
				});
			}
		}
	}

	showToast(toast: ChatToast) {
		if (this.toastTimer) {
			clearTimeout(this.toastTimer);
		}
		this.activeToast = toast;
		this.playChime();
		this.toastTimer = setTimeout(() => {
			this.activeToast = null;
		}, 6000);
	}

	dismissToast() {
		if (this.toastTimer) {
			clearTimeout(this.toastTimer);
			this.toastTimer = null;
		}
		this.activeToast = null;
	}

	playChime() {
		try {
			const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (!AudioContextClass) return;
			const audioCtx = new AudioContextClass();
			
			// Gentle two-tone notification ping
			const now = audioCtx.currentTime;
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();

			osc.type = 'sine';
			osc.frequency.setValueAtTime(587.33, now); // D5
			osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

			gain.gain.setValueAtTime(0.001, now);
			gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

			osc.connect(gain);
			gain.connect(audioCtx.destination);

			osc.start(now);
			osc.stop(now + 0.35);
		} catch {
			// Ignore Web Audio errors if audio is blocked before user gesture
		}
	}
}

export const chatState = new ChatState();
