import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'image',
  'description',
  'options',
]) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
