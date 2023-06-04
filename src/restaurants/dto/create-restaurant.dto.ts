import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'address',
  'coverImage',
]) {
  @Field(() => Number)
  categoryId: number;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
