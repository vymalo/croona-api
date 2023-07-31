import { ICommand } from '@nestjs/cqrs';

export class UpdateItemCommand<T = any> implements ICommand {
  constructor(
    public readonly collection: string,
    public readonly id: string | undefined,
    public readonly item: T,
  ) {}
}
