import type { IDomainEvent } from '$lib/domain/events/IDomainEvent';

export type EventHandler<T extends IDomainEvent> = (event: T) => void | Promise<void>;

export interface IEventDispatcher {
	dispatch(eventName: string, event: IDomainEvent): Promise<void>;
	register<T extends IDomainEvent>(eventName: string, handler: EventHandler<T>, handlerId?: string): void;
	unregister<T extends IDomainEvent>(eventName: string, handler: EventHandler<T>): void;
}
