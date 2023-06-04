import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantsInput extends PaginationInput {
  @Field(() => String, { nullable: false })
  @IsString()
  query?: string;
}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[];
}
