import type { IDomainEvent } from '$lib/domain/events/IDomainEvent';
import type { IEventDispatcher, EventHandler } from '$lib/application/interfaces/IEventDispatcher';

interface RegisteredHandler<T extends IDomainEvent> {
	id?: string;
	fn: EventHandler<T>;
}

export class DomainEventDispatcher implements IEventDispatcher {
	private static instance: DomainEventDispatcher;
	private handlers: Map<string, RegisteredHandler<any>[]> = new Map();

	private constructor() {}

	public static getInstance(): DomainEventDispatcher {
		if (!DomainEventDispatcher.instance) {
			DomainEventDispatcher.instance = new DomainEventDispatcher();
		}
		return DomainEventDispatcher.instance;
	}

	public register<T extends IDomainEvent>(eventName: string, handler: EventHandler<T>, handlerId?: string): void {
		if (!this.handlers.has(eventName)) {
			this.handlers.set(eventName, []);
		}
		const list = this.handlers.get(eventName)!;
		if (handlerId) {
			const index = list.findIndex((h) => h.id === handlerId);
			if (index !== -1) {
				list[index] = { id: handlerId, fn: handler };
				return;
			}
			list.push({ id: handlerId, fn: handler });
		} else {
			list.push({ fn: handler });
		}
	}

	public unregister<T extends IDomainEvent>(eventName: string, handler: EventHandler<T>): void {
		if (this.handlers.has(eventName)) {
			const handlers = this.handlers.get(eventName)!;
			const index = handlers.findIndex((h) => h.fn === handler);
			if (index !== -1) {
				handlers.splice(index, 1);
			}
		}
	}

	public async dispatch(eventName: string, event: IDomainEvent): Promise<void> {
		const eventHandlers = this.handlers.get(eventName);
		if (eventHandlers && eventHandlers.length > 0) {
			await Promise.all(eventHandlers.map((h) => h.fn(event)));
		}
	}

	public clear(eventName?: string): void {
		if (eventName) {
			this.handlers.delete(eventName);
		} else {
			this.handlers.clear();
		}
	}
}

export const eventDispatcher = DomainEventDispatcher.getInstance();

