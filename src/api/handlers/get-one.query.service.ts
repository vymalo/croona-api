import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindItemsQuery } from '../models/find-items.query';
import { BadRequestException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../shared/tokens/db-token';
import mongoose from 'mongoose';
import { BSONError } from 'bson';

@QueryHandler(FindItemsQuery)
export class GetOneQueryService implements IQueryHandler<FindItemsQuery> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly mg: mongoose.Mongoose,
  ) {}

  async execute({ collection: cname, ids }: FindItemsQuery): Promise<any> {
    const collection = this.mg.connection.collection(cname);
    let items: mongoose.mongo.WithId<any>[];
    try {
      items = await collection
        .find({
          _id: {
            $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
          },
        })
        .toArray();
    } catch (e) {
      if (e instanceof mongoose.Error.CastError || e instanceof BSONError) {
        throw new BadRequestException('Invalid id');
      }
      throw e;
    }

    if (!items) {
      throw new BadRequestException('Item not found');
    }

    return items.map((item) => {
      item.id = item._id.toString();
      delete item._id;
      return item;
    });
  }
}
