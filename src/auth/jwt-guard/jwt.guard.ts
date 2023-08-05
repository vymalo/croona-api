import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  public handleRequest(err: any, user: any, info: any) {
    Logger.log(
      `JwtGuard.handleRequest: ${JSON.stringify({ err, user, info })}`,
      'JwtGuard',
    );
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
