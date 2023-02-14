import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DishesService } from './dishes.service';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { setRole } from 'src/auth/setRole.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver()
export class DishesResolver {
  constructor(private readonly dishesService: DishesService) {}

  @Mutation(() => CreateDishOutput)
  @setRole(['Owner'])
  createDish(
    @AuthUser() user: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.dishesService.createDish(user.id, createDishInput);
  }
}
