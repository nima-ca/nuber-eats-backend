import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class userProfileInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class userProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
