import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Verification } from '../entities/verification.entity';
import { CoreOutput } from 'src/common/dto/output.dto';

@InputType()
export class EmailVerificationInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class EmailVerificationOutput extends CoreOutput {}
