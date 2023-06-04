import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { setRole } from 'src/auth/setRole.decorator';
import { LoginInput, LoginOutput } from './dto/Login.dto';
import { CreateAccountInput, CreateAccountOutput } from './dto/create-user.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import {
  EmailVerificationInput,
  EmailVerificationOutput,
} from './dto/email-verification.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @setRole(['Any'])
  @Query(() => User)
  me(@AuthUser() user: User): User {
    return user;
  }

  @setRole(['Any'])
  @Mutation(() => EditProfileOutput)
  editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(user.id, editProfileInput);
  }

  @Mutation(() => EmailVerificationOutput)
  verifyEmail(
    @Args('input') emailVerificationInput: EmailVerificationInput,
  ): Promise<EmailVerificationOutput> {
    return this.usersService.verifyEmail(emailVerificationInput);
  }
}
