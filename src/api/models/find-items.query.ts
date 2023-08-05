import { IQuery } from '@nestjs/cqrs';
import { ParsedQs } from 'qs';

export class FindItemsQuery implements IQuery {
  constructor(
    public readonly collection: string,
    public readonly query?: ParsedQs,
  ) {}
}
