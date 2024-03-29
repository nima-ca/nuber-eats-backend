import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  OptionalPaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Category } from '../entity/category.entity';

@InputType()
export class CategoryInput extends OptionalPaginationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
