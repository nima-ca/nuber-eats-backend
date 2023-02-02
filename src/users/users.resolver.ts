import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-user.input';
import { LoginInput, LoginOutput } from './dto/Login.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { userProfileInput, userProfileOutput } from './dto/user-profile.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    try {
      return this.usersService.createAccount(createAccountInput);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput) {
    try {
      return this.usersService.login(loginInput);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @UseGuards(AuthGuard)
  @Query(() => User)
  me(@AuthUser() user: User): User {
    console.log('user' + user);
    return user;
  }

  @UseGuards(AuthGuard)
  @Query(() => userProfileOutput)
  async userProfile(
    @Args() { userId }: userProfileInput,
  ): Promise<userProfileOutput> {
    return this.usersService.userProfile(userId);
  }
}
