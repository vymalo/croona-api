import { ICommand } from '@nestjs/cqrs';

export class PublishItemCommand<T = any> implements ICommand {
  constructor(
    public readonly collection: string,
    public readonly id: string,
    public readonly item: T,
  ) {}
}
