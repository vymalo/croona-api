import { Test, TestingModule } from '@nestjs/testing';
import { PermissionConfigService } from './permission-config.service';

describe('PermissionConfigService', () => {
  let service: PermissionConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionConfigService],
    }).compile();

    service = module.get<PermissionConfigService>(PermissionConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
