import {
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { RuleConfigService } from '../../app-config/rule-config/rule-config.service';
import * as pathToRegexp from 'path-to-regexp';
import * as jexl from 'jexl';
import { opFromMethod } from '../../shared/functions/op-from-method';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RulesMiddleware implements NestMiddleware {
  constructor(private readonly ruleConfigService: RuleConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    Logger.debug(`RulesMiddleware ${req.originalUrl}`, 'RulesMiddleware');
    const p = req.originalUrl.split('/api')[1];
    // Try to get the rule from the cache
    let rule = await this.ruleConfigService.getRule(
      p,
      opFromMethod(req.method),
    );

    let params: Record<string, any> = {};

    Logger.debug(`rule ${rule}`, 'RulesMiddleware');
    // If the rule is not in the cache, generate it
    if (!rule) {
      // Parse your YML file here and generate your rules
      const rules = await this.ruleConfigService.getPermissionsKeyFromCache();

      Logger.debug(`rules ${rules}`, 'RulesMiddleware');
      // Find the matching rule
      const found = rules.find((r) => {
        const re = pathToRegexp.pathToRegexp(r);
        return re.test(p);
      });

      Logger.debug(`found ${found}`, 'RulesMiddleware');
      // If no matching rule, deny access
      if (!found) {
        Logger.debug(`Access Denied ${found}`, 'RulesMiddleware');
        throw new ForbiddenException('Access Denied', 'You are not allowed');
      }

      const matchResult = pathToRegexp.match(found, {
        decode: decodeURIComponent,
      })(p);
      if (matchResult) {
        params = matchResult.params;
      }

      rule = await this.ruleConfigService.getRule(
        found,
        opFromMethod(req.method),
      );
      Logger.debug(`rule ${rule}`, 'RulesMiddleware');
    }

    const user = (req as any).user;

    // TODO make this object dynamic
    // Define the context
    const context = {
      ...params,
      auth: user
        ? {
            uid: user.uid,
            isAdmin: user.isAdmin,
          }
        : null,
    };

    // Evaluate the rule
    const result = await jexl.eval(rule, context).catch((err) => {
      console.error(`rule "${rule}" evaluation error`, err);
      return false;
    });

    if (!result) {
      throw new ForbiddenException('Access Denied', 'You are not allowed');
    }

    return next();
  }
}
