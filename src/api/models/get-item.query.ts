import { IQuery } from '@nestjs/cqrs';

export class GetItemQuery implements IQuery {
  constructor(public readonly collection: string, public readonly id: string) {}
}
