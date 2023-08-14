import { Test, TestingModule } from '@nestjs/testing';
import { SchemaConfigService } from './schema-config.service';

describe('SchemaConfigService', () => {
  let service: SchemaConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaConfigService],
    }).compile();

    service = module.get<SchemaConfigService>(SchemaConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
