import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { MutationOutputDto } from 'src/common/dto/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class LoginOutput extends MutationOutputDto {
  @Field(() => String, { nullable: true })
  token?: string;
}

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
