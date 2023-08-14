import { RulesMiddleware } from './rules.middleware';

describe('RulesMiddleware', () => {
  it('should be defined', () => {
    expect(new RulesMiddleware()).toBeDefined();
  });
});
