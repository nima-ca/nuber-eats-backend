import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DishesService } from './dishes.service';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { setRole } from 'src/auth/setRole.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { DeleteDishInput, DeleteDishOutput } from './dto/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';

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

  @Mutation(() => DeleteDishOutput)
  @setRole(['Owner'])
  deleteDish(
    @AuthUser() user: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.dishesService.deleteDish(user.id, deleteDishInput);
  }

  @Mutation(() => EditDishOutput)
  @setRole(['Owner'])
  editDish(
    @AuthUser() user: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.dishesService.editDish(user.id, editDishInput);
  }
}
