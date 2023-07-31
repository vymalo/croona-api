import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateItemCommand } from '../models/update-item.command';
import { GetItemQuery } from '../models/get-item.query';
import { DeleteItemCommand } from '../models/delete-item.command';

@Injectable()
export class CollectionService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    collection: string,
    body: Record<string, any>,
  ): Promise<Record<string, any>> {
    return this.commandBus.execute(
      new UpdateItemCommand(collection, undefined, body),
    );
  }

  public async updateOne(
    collection: string,
    id: string,
    body: Record<string, any>,
  ): Promise<Record<string, any>> {
    return this.commandBus.execute(new UpdateItemCommand(collection, id, body));
  }

  public async get(
    collection: string,
    id: string,
  ): Promise<Record<string, any>> {
    return this.queryBus.execute(new GetItemQuery(collection, id));
  }

  public async deleteOne(collection: string, id: string): Promise<void> {
    await this.commandBus.execute(new DeleteItemCommand(collection, id));
  }
}
