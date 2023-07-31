import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CollectionService } from './collection/collection.service';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiSagaService } from './handlers/api-saga.service';
import { ApiGetOneQueryService } from './handlers/api-get-one.query.service';
import { DatabaseModule } from '../database/database.module';
import { PublishItemCommandService } from './handlers/publish-item.command.service';
import { UpdateItemCommandService } from './handlers/update-item.command.service';
import { SdkModule } from '../sdk/sdk.module';

@Module({
  imports: [CqrsModule, DatabaseModule, SdkModule],
  controllers: [ApiController],
  providers: [
    CollectionService,
    ApiSagaService,
    ApiGetOneQueryService,
    PublishItemCommandService,
    UpdateItemCommandService,
  ],
})
export class ApiModule {}
