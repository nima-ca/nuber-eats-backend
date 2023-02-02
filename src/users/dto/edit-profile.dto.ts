import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entities';
import { User } from '../entities/user.entity';
import { CoreOutput } from 'src/common/dto/output.dto';

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}

@ObjectType()
export class EditProfileOutput extends CoreOutput {}
