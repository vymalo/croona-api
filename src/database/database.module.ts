import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../shared/tokens/db-token';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

const providers = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (configService: ConfigService) =>
      mongoose.connect(configService.get<string>('MONGO_URL')),
    inject: [ConfigService],
  },
];

@Module({
  exports: [...providers],
  providers: [...providers],
})
export class DatabaseModule {}
