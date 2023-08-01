import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../shared/tokens/db-token';
import mongoose from 'mongoose';
import { BSONError } from 'bson';
import { UpdateItemCommand } from '../models/update-item.command';
import { ItemUpdatedEvent } from '../models/item-updated.event';

@CommandHandler(UpdateItemCommand)
export class UpdateItemCommandService<T = any>
  implements ICommandHandler<UpdateItemCommand<T>>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly mg: mongoose.Mongoose,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateItemCommand<T>): Promise<any> {
    const collection = this.mg.connection.collection(command.collection);

    try {
      const result = !!command.id
        ? await collection.replaceOne(
            { _id: new mongoose.Types.ObjectId(command.id) },
            command.item,
            { upsert: true },
          )
        : await collection.insertOne(command.item);

      let insertedId: mongoose.Types.ObjectId;
      if ('insertedId' in result) {
        insertedId = result.insertedId;
      } else {
        insertedId = new mongoose.Types.ObjectId(command.id);
      }

      const { _id, ...item } = await collection.findOne({
        _id: insertedId,
      });
      item.id = _id.toString();

      this.eventBus.publish(
        new ItemUpdatedEvent(command.collection, insertedId.toString(), item),
      );
      return item;
    } catch (e) {
      if (e instanceof mongoose.Error.CastError || e instanceof BSONError) {
        throw new BadRequestException('Invalid id');
      }
      throw e;
    }
  }
}
