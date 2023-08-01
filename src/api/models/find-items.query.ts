import { IQuery } from '@nestjs/cqrs';

export class FindItemsQuery implements IQuery {
  constructor(
    public readonly collection: string,
    public readonly ids: string[] = [],
  ) {}
}
