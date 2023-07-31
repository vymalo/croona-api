import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetItemQuery } from '../models/get-item.query';
import { BadRequestException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../shared/tokens/db-token';
import mongoose from 'mongoose';
import { BSONError } from 'bson';

@QueryHandler(GetItemQuery)
export class ApiGetOneQueryService implements IQueryHandler<GetItemQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly mg: mongoose.Mongoose,
  ) {}

  async execute(query: GetItemQuery): Promise<any> {
    const collection = this.mg.connection.collection(query.collection);
    let item: mongoose.mongo.WithId<any>;
    try {
      item = await collection.findOne({
        _id: new mongoose.Types.ObjectId(query.id),
      });
    } catch (e) {
      if (e instanceof mongoose.Error.CastError || e instanceof BSONError) {
        throw new BadRequestException('Invalid id');
      }
      throw e;
    }

    if (!item) {
      throw new BadRequestException('Item not found');
    }
    return item;
  }
}
