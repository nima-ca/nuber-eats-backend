import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { USER_KEY } from 'src/common/common.constatns';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    return gqlContext[USER_KEY];
  },
);
