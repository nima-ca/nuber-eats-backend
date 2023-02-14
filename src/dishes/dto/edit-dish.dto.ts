import {
  InputType,
  PickType,
  Field,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Dish } from '../entities/dish.entity';
import { CreateDishInput } from './create-dish.dto';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'description',
  'price',
  'options',
]) {
  @Field(() => Number)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
