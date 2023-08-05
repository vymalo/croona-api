import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CollectionService } from './collection/collection.service';
import { CqrsModule } from '@nestjs/cqrs';
import { SagaService } from './handlers/saga.service';
import { GetOneQueryService } from './handlers/get-one.query.service';
import { PublishItemCommandService } from './handlers/publish-item.command.service';
import { UpdateItemCommandService } from './handlers/update-item.command.service';
import { SdkModule } from '../sdk/sdk.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppCacheModule } from '../app-cache/app-cache.module';
import { RulesMiddleware } from './rules/rules.middleware';

@Module({
  imports: [CqrsModule, SdkModule, AppCacheModule, AppConfigModule],
  controllers: [ApiController],
  providers: [
    CollectionService,
    SagaService,
    GetOneQueryService,
    PublishItemCommandService,
    UpdateItemCommandService,
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RulesMiddleware).forRoutes('/api/*'); // applies to all routes
  }
}
