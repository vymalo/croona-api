import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishItemCommand } from '../models/publish-item.command';
import { ClientMqtt } from '@nestjs/microservices/client/client-mqtt';
import { Inject } from '@nestjs/common';
import { SDK_CLIENT_TOKEN } from '../../shared/tokens/mqtt-token';

@CommandHandler(PublishItemCommand)
export class PublishItemCommandService
  implements ICommandHandler<PublishItemCommand>
{
  constructor(
    @Inject(SDK_CLIENT_TOKEN)
    private readonly clientProxy: ClientMqtt,
  ) {}

  public async execute({
    item,
    id,
    collection,
  }: PublishItemCommand): Promise<any> {
    this.clientProxy.emit(`collections/${collection}/updates/${id}`, item);
  }
}
