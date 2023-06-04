import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Verification } from '../entities/verification.entity';

@InputType()
export class EmailVerificationInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class EmailVerificationOutput extends CoreOutput {}
