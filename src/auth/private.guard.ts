import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { IS_PRIVATE_KEY } from './private.decorator';

@Injectable()
export class PrivateGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPrivate = this.reflector.getAllAndOverride<boolean>(
      IS_PRIVATE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!isPrivate) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return user.role == Role.ADMIN;
  }
}
