import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../shared/tokens/db-token';
import mongoose from 'mongoose';
import { UpdateItemCommand } from '../models/update-item.command';
import { ItemUpdatedEvent } from '../models/item-updated.event';
import { SchemaConfigService } from '../../app-config/schema-config/schema-config.service';
import { BSONError } from 'bson';

@CommandHandler(UpdateItemCommand)
export class UpdateItemCommandService<T = any>
  implements ICommandHandler<UpdateItemCommand<T>>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly schemaConfigService: SchemaConfigService,
  ) {}

  async execute(command: UpdateItemCommand<T>): Promise<any> {
    const schema = await this.schemaConfigService.getSchema<T>(
      command.collection,
    );

    if (!schema) {
      throw new BadRequestException('Invalid collection');
    }

    let insertedId: mongoose.Types.ObjectId;
    try {
      const result = !!command.id
        ? await schema
            .updateOne(
              { _id: new mongoose.Types.ObjectId(command.id) },
              command.item,
            )
            .exec()
        : await schema.create(command.item);

      if ('id' in result) {
        insertedId = result.id;
      } else {
        insertedId = new mongoose.Types.ObjectId(command.id);
      }
    } catch (e) {
      if (e instanceof mongoose.Error.CastError || e instanceof BSONError) {
        throw new BadRequestException('Invalid id');
      }
      throw e;
    }

    const res = await schema
      .findOne({
        _id: insertedId,
      })
      .exec();
    const item = res.toObject();
    item._id = item._id.toString();

    this.eventBus.publish(
      new ItemUpdatedEvent(command.collection, insertedId.toString(), item),
    );
    return item;
  }
}
