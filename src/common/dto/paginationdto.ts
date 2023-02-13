import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { CoreOutput } from './output.dto';

const DEFAULT_PAGE_VALUE = 1;
const DEFAULT_COUNT_VALUE = 10;

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: DEFAULT_PAGE_VALUE })
  @Min(1)
  page: number = DEFAULT_PAGE_VALUE;

  @Field(() => Number, { defaultValue: DEFAULT_COUNT_VALUE })
  @Min(1)
  count: number = DEFAULT_COUNT_VALUE;
}

@InputType()
export class OptionalPaginationInput extends PartialType(PaginationInput) {}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  totalPages?: number;
}
