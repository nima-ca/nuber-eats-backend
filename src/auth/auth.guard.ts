import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { ROLE_METADATA_KEY, USER_KEY } from 'src/common/common.constatns';
import { AllowedRoles } from 'src/common/common.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<AllowedRoles[]>(
      ROLE_METADATA_KEY,
      context.getHandler(),
    );

    // allow access to the resolver without a metadata
    if (!roles) return true;

    // check if the user is authenticated
    const user = this.getUser(context);
    if (!user) throw new UnauthorizedException('Please log into your account!');

    // let all the users access the resolver
    if (roles.includes('Any')) return true;

    // check if the user has access to the resolver
    if (!roles.includes(user.role))
      throw new ForbiddenException(
        'You are not allowed to access this action!',
      );

    return true;
  }

  getUser(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    return gqlContext[USER_KEY];
  }
}
