import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class UpdateRestaurantOutput extends CoreOutput {}
