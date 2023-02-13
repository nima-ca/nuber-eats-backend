import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Category } from '../entity/category.entitiy';
import {
  OptionalPaginationInput,
  PaginationOutput,
} from 'src/common/dto/paginationdto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

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
