import type { IDomainEvent } from '$lib/domain/events/IDomainEvent';

type EventHandler<T extends IDomainEvent> = (event: T) => void | Promise<void>;

export class DomainEventDispatcher {
	private static instance: DomainEventDispatcher;
	private handlers: Map<string, EventHandler<any>[]> = new Map();

	private constructor() {}

	public static getInstance(): DomainEventDispatcher {
		if (!DomainEventDispatcher.instance) {
			DomainEventDispatcher.instance = new DomainEventDispatcher();
		}
		return DomainEventDispatcher.instance;
	}

	public register<T extends IDomainEvent>(eventName: string, handler: EventHandler<T>): void {
		if (!this.handlers.has(eventName)) {
			this.handlers.set(eventName, []);
		}
		this.handlers.get(eventName)!.push(handler);
	}

	public async dispatch(eventName: string, event: IDomainEvent): Promise<void> {
		const eventHandlers = this.handlers.get(eventName);
		if (eventHandlers) {
			// Execute all handlers concurrently or sequentially depending on need
			await Promise.all(eventHandlers.map(handler => handler(event)));
		}
	}
}

export const eventDispatcher = DomainEventDispatcher.getInstance();
