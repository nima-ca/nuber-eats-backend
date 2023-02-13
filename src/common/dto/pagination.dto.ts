import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNumber, Max, Min } from 'class-validator';
import { CoreOutput } from './output.dto';

const DEFAULT_PAGE_VALUE = 1;
const DEFAULT_COUNT_VALUE = 10;

@InputType()
export class PaginationInput {
  @Min(1)
  @IsNumber()
  @Field(() => Number, { defaultValue: DEFAULT_PAGE_VALUE })
  page: number = DEFAULT_PAGE_VALUE;

  @Min(1)
  @Max(100)
  @IsNumber()
  @Field(() => Number, { defaultValue: DEFAULT_COUNT_VALUE })
  count: number = DEFAULT_COUNT_VALUE;
}

@InputType()
export class OptionalPaginationInput extends PartialType(PaginationInput) {}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  totalPages?: number;
}
