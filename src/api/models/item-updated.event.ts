import { IEvent } from '@nestjs/cqrs';

export class ItemUpdatedEvent<T = any> implements IEvent {
  constructor(
    public readonly collection: string,
    public readonly id: string,
    public readonly item: T,
  ) {}
}
