import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as mongoose from 'mongoose';
import { DATABASE_CONNECTION } from '../shared/tokens/db-token';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly mg: mongoose.Mongoose,
  ) {
    super();
  }

  async isMongoHealthy(key: string): Promise<HealthIndicatorResult> {
    const result = this.mg.connection.readyState === 1;

    if (result) {
      return this.getStatus(key, true, { message: 'MongoDB is connected' });
    }

    return this.getStatus(key, false, { message: 'MongoDB is not connected' });
  }
}
