import { ICommand } from '@nestjs/cqrs';

export class DeleteItemCommand implements ICommand {
  constructor(public readonly collection: string, public readonly id: string) {}
}
