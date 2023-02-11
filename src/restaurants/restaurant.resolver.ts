import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { setRole } from 'src/auth/setRole.decorator';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto/update-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @setRole(['Owner'])
  createRestaurant(
    @AuthUser() user: User,
    @Args('input') CreateRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(user, CreateRestaurantInput);
  }

  @Mutation(() => UpdateRestaurantOutput)
  @setRole(['Owner'])
  updateRestaurant(
    @AuthUser() user: User,
    @Args('input') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(user, updateRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @setRole(['Owner'])
  deleteRestaurant(
    @AuthUser() user: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(user, deleteRestaurantInput);
  }
}